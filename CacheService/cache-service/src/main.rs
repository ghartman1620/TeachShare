/*
Message for...
Watch 
{
    "message": "watch"
    "id" : number
}

Create
{
    "message": "create"
    "post" : {
        ...
    }
}

Update,
{
    "message": "update"
    "post" : {
        "id" : number
        ...
    }
}

Get
{
    "message": "get"
    "id" : number
}
*/

/*!
 The websocket cache service is used for realtime communication between connected users.
*/
#![feature(vec_remove_item)]
#![warn(clippy)]

extern crate ws;
#[macro_use]
extern crate serde_derive;
extern crate dotenv;
extern crate serde_json;

extern crate actix;
use actix::Actor;

extern crate futures;
// use futures::future::Future;
use futures::{future, Future};

#[macro_use]
extern crate crossbeam_channel;

#[macro_use]
extern crate diesel;

use std::fmt;
use ws::{listen, CloseCode, Error, Handler, Handshake, Message, Sender};

mod cache;
mod db;
mod models;
mod pool;
mod schema;

use cache::*;
use db::save_posts;
use models::*;

use models::MessageType;
use std::rc::{Rc, Weak};
use std::sync::Arc;
use std::thread;
use std::sync::RwLock;
use std::cell::RefCell;

#[derive(Debug, Clone)]
struct GrandSocketStation {
    // represents the list of users
    connections: Vec<Rc<Connection>>,
    // represents the resource that are being watched by users
    // watches: Vec<models::Resource>,
}

impl GrandSocketStation {
    pub fn get_connections(&self) -> &Vec<Rc<Connection>> {
        return &self.connections;
    }
    pub fn get_connections_mut(&mut self) -> &mut Vec<Rc<Connection>> {
        return &mut self.connections;
    }
    pub fn push_connection(&mut self, conn: Connection) {
        return self.connections.push(Rc::new(conn));
    }
    pub fn set_parent(&mut self, conn: Connection) {
        for a in &mut self.connections {
            println!("mutable ref: {:?}", a);
            // if a == &mut conn {
            //     println!("setting {:?}...", a);
            //     a.parent = Weak::new();
            // }
        }
        // let c = self.connections.into_iter().find(|x| *x==conn);
        // println!("set_parent: {:?}", c);
        // match c {
        //     Some(val) => {},
        //     None => {},
        // }
    }
}

impl std::cmp::PartialEq for Connection {
    fn eq(&self, rhs: &Connection) -> bool {
        self.id == rhs.id
    }
}

#[derive(Clone)]
struct Connection {
    parent: Option<Rc<RefCell<GrandSocketStation>>>,
    id: i32,
    tx: Sender,
    to_cache: crossbeam_channel::Sender<SafeArcMsg>,
    from_cache: crossbeam_channel::Receiver<SafeArcMsg>,
    kill_cache: crossbeam_channel::Sender<Cancel>,
}

impl fmt::Debug for Connection {                                                
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Connection ID: {}, sender: {}",
            self.id,
            self.tx.connection_id()
        )
    }
}

#[derive(Serialize, Deserialize, Debug)]
enum IdOrPost {
    Id(i32),
    Post(models::Post),
}

/// Recieved msg:
///
/// WSMessage { message: Create, id: None, post: Some(Post { id: 1, title: "test post title",
/// content: Object({"content": String("<b>bold</b>"), "type": String("text")}), likes: 0, tags: Object({}),
/// user_id: 1, draft: false, content_type: 0, grade: 0, subject: 0, crosscutting_concepts: [1, 2, 3],
/// disciplinary_core_ideas: [1, 3, 5], practices: [2, 1] }) }
///
#[derive(Serialize, Deserialize, Debug)]
struct WSMessage {
    message: MessageType,
    id: Option<i32>,
    post: Option<models::Post>, //id_or_post: IdOrPost
}

impl Handler for Connection {
    fn on_open(&mut self, hs: Handshake) -> ws::Result<()> {
        // We have a new connection, so we increment the connection counter
        // .get_mut(&self.count.get()).get_or_insert(&mut hs.peer_addr.unwrap().ip());  // insert(self.count.get(), hs);
        //  self.connections[self.out.connection_id()] = self.out;
        println!("HANDSHAKE --> {:?}", hs);
        println!("client connected");
        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> ws::Result<()> {
        // this is the Tx for where this data message came from

        let result = match msg {
            Message::Binary(bin) => {
                //println!("Received binary message")
                println!("{:?}", bin);
                panic!("Received binary message");
            } // ..
            Message::Text(text) => {
                println!("{}", text);

                // println!("WEAK --> {:?}", self.parent.strong());
                // let mut g = &mut self.parent.expect("could not unwrap option..");
                println!("RC: {:?}", self.parent);
                match &mut self.parent {
                    Some(val) => {
                        println!("Some: {:?}", val);
                        match val.try_borrow_mut() {
                            Ok(parent) => {
                                println!("OK: {:?}", parent);
                                println!("connections: {:?}", parent.connections);
                                println!("connection count: {}", parent.connections.len());
                                for c in &parent.connections {
                                    println!("Connection --> {:?}", c);
                                }
                            },
                            Err(e) => println!("Error: {:?}!", e),
                        }
                    
                    },
                    None => {println!("None. Did not unwrap.")},
                }
                // let gss: &mut GrandSocketStation = Rc::get_mut(g).expect("could not get mut");
                // let mut conn = &mut gss.connections;
                // println!("CONNECTIONS: {:?}", conn);

                let json: Result<WSMessage, serde_json::Error> = serde_json::from_str(&text);
                // println!("[JSON] ----> {:?}", json.unwrap());
                let response: Result<Vec<Post>, String> = match json {
                    Ok(msg) => {
                        let msg_result: Result<Vec<Post>, String> = match msg.message {
                            MessageType::Get => self.handle_get_msg(msg),
                            MessageType::Create => self.handle_create_msg(msg),
                            MessageType::Watch => self.handle_watch_msg(msg),
                            MessageType::Update => self.handle_update_msg(msg),
                            MessageType::Manifest => self.handle_manifest_msg(msg),
                        };
                        msg_result
                    }
                    Err(e) => Err(format!("There is a terrible error: {:?}", e)),
                };
                let resp = response.expect("There was an error!");
                let serialized =
                    serde_json::to_string(&resp).expect("Uh-oh... JSON serialization error!~");
                println!("Serialized content: {}", serialized);
                self.tx.send(serialized)
            }
        };
        // self.tx.broadcast(msg)
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away => {
                println!("The client is leaving the site.");
                match &mut self.parent {
                    Some(val) => {
                        println!("Some: {:?}", val);
                        match val.try_borrow_mut() {
                            Ok(ref mut parent) => {
                                println!("OK: {:?}", parent);
                                println!("connections: {:?}", parent.connections);
                                let mut exiting_connection_id = 0;
                                let old_connection_id = self.tx.connection_id();
                                println!("connection count: {}", parent.connections.len());
                                {
                                    exiting_connection_id = parent.connections.clone().into_iter().position(|x| x.tx.connection_id()==old_connection_id).unwrap();
                                }
                                parent.connections.remove(exiting_connection_id);
                                for c in &parent.connections {
                                    println!("Connection --> {:?}", c);
                                }
                            },
                            Err(e) => println!("Error: {:?}!", e),
                        }
                    
                    },
                    None => {println!("None. Did not unwrap.")},
                }
                
            }
            CloseCode::Abnormal => {
                println!("Closing handshake failed! Unable to obtain closing status from client.")
            }
            _ => println!("The client encountered an error: {}", reason),
        }
    }

    fn on_error(&mut self, err: Error) {
        println!("The server encountered an error: {:?}", err);
    }
}

impl Connection {
    fn handle_get_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        println!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Get);
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Get)
            .build();

        let mut p = Post::new();
        p.id = match msg.id {
            Some(id) => id,
            None => return Err(String::from("No Post ID provided.")),
        };

        wrap.items_mut().push(Arc::new(Resource::new(p)));

        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {}
            Err(e) => {
                println!("[Error] ---> {:?}", e);
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val.items().clone(), // @TODO: figure out how to avoid clone/copy
            Err(e) => {
                println!("[Error] ---> {:?}", e);
                let ret: String = format!("Error receiving from channel (from cache).");
                return Err(ret);
            }
        };
        println!("resp: {:?}", resp);

        let output: Vec<Post> = resp.iter().map(|x| (*x.get_data()).clone()).collect();
        Ok(output)
    }
    fn handle_create_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        println!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Create);
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Create)
            .build();

        let p = match msg.post {
            Some(post) => post,
            None => {
                // fail-fast
                return Err(String::from("No post was provided!"));
            }
        };

        wrap.items_mut().push(Arc::new(Resource::new(p)));
        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {
                println!("Sucessfully sent and got in return: {:?}", val);
            }
            Err(e) => {
                println!(
                    "There was an error communicating with the cache! Err: {:?}",
                    e
                );
                return Err(String::from(
                    "There was an error communicating with the cache.",
                ));
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val.items().clone(), // @TODO: figure out how to avoid clone/copy
            Err(e) => {
                return Err(String::from("Error receiving from channel (from cache)."));
            }
        };
        println!("resp: {:?}", resp);

        let output: Vec<Post> = resp.iter().map(|x| (*x.get_data()).clone()).collect();
        Ok(output)
    }

    fn handle_manifest_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        unimplemented!()
    }
    fn handle_update_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        
        println!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Update);
        unimplemented!()
    }
    fn handle_watch_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        println!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Watch);
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Watch)
            .build();

        // does the request have a Post ID?
        let post_id = match msg.id {
            Some(post_id) => post_id,
            None => {
                // fail-fast
                return Err(String::from("No post ID was provided!"));
            }
        };
        let mut post = Post::new();
        post.id = post_id;
        let mut resource = Resource::new(post);

        let token = self.tx.token();
        let conn_id = self.tx.connection_id();
        println!("TOKEN: {:?}", token.0);
        println!("Connection ID: {:?}", conn_id);
        println!("Post ID: {:?}", post_id);

        // add watch to resource
        resource.add_watch(conn_id as i32);
        wrap.connection_id = conn_id as i32;

        // wrap it up and send
        wrap.items_mut().push(Arc::new(resource));
        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {
                println!("Sucessfully sent and got in return: {:?}", val);
            }
            Err(e) => {
                println!(
                    "There was an error communicating with the cache! Err: {:?}",
                    e
                );
                return Err(String::from(
                    "There was an error communicating with the cache.",
                ));
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val.items().clone(), // @TODO: figure out how to avoid clone/copy
            Err(e) => {
                return Err(String::from("Error receiving from channel (from cache)."));
            }
        };
        println!("resp: {:?}", resp);

        Ok(vec![])
    }
}

// #[derive(Debug)]
// struct DosTuple(i64, i64);

// impl actix::Message for DosTuple {
//     type Result = String;
// }

// struct MyActor;

// impl actix::Actor for MyActor {
//     type Context = actix::Context<Self>;

//     fn started(&mut self, ctx: &mut Self::Context) {
//        println!("I am alive!");
//        actix::Arbiter::system().do_send(actix::msgs::SystemExit(0));
//     }
// }

// impl actix::Handler<DosTuple> for MyActor {
//     type Result = String;

//     fn handle(&mut self, msg: DosTuple, ctx: &mut actix::Context<Self>) -> Self::Result {
//         println!("handle: {:?}", msg);
//         String::from("this is just a test...")
//     }
// }

fn main() {
    let hub = Rc::new(RefCell::new(GrandSocketStation {
        connections: vec![],
    }));
    let i = &mut 0;
    
    // start db (SAVE only) thread
    let (send_db, recv_db) = crossbeam_channel::unbounded();
    let db_handle = thread::spawn(move || {
        save_posts(recv_db);
    });

    // start cache + return necessary comm. channels
    let (a, b, c): (
        crossbeam_channel::Sender<SafeArcMsg>,
        crossbeam_channel::Receiver<SafeArcMsg>,
        crossbeam_channel::Sender<Cancel>,
    ) = wire_up(send_db);


    /// Test actix actor framework stuff (again)
    
    // let system = actix::System::new("test");
    // // let thr_system = system.clone();

    // let addr: actix::Addr<actix::Syn, _> = MyActor.start();
    // let thread_addr = addr.clone();
    // let my_actor = addr.recipient();
    // my_actor.send(DosTuple(1, 1));
    
    // let res = thread_addr.send(DosTuple(0, 0));
    // let res1 = thread_addr.send(DosTuple(0, 0));
    
    // system.handle().spawn(res.then(|res| {
    //         println!("RES: {:?}", res);
    //         future::result(Ok(()))
    // }));
    // system.handle().spawn(res1.then(|res| {
    //     println!("RES1: {:?}", res);
    //     future::result(Ok(()))ID:ID:
    // }));    
    // system.run();
    //let hub_inner = hub.unwrap().clone();

    listen("127.0.0.1:3012", move |out| {
        let mut value = None;
        
        {
            value = Some(Connection {
                id: *i,
                tx: out.clone(), 
                parent: Some(hub.clone()),
                to_cache: a.clone(),
                from_cache: b.clone(),
                kill_cache: c.clone(),
            });
        }

        
        let conn = value.unwrap();

        let h = &mut hub.borrow_mut();
        // let h = &mut hub.unwrap().clone();
        // let hub_mut = Rc::get_mut(h).expect("Uh oh... Could not borrow hub");
        h.push_connection(conn.clone());

        let value: Option<Connection> = Some(conn.clone());
        
        
        
        // {
        //     let conn = Connection {
        //         id: *i,
        //         tx: out, 
        //         parent: Rc::downgrade(*hub.read().unwrap()),
        //         to_cache: a.clone(),
        //         from_cache: b.clone(),
        //         kill_cache: c.clone(),
        //     };
        // }
        

        // {
        //     let hub_mut = Rc::get_mut(&mut hub.unwrap()).expect("Uh oh... Could not borrow hub");
            
        //     hub_mut.into_inner().push_connection(conn.clone());
        //     // hub_mut.connections[*i as usize].parent = weak;
        // }
        *i += 1;
        value.unwrap()
    }).unwrap();

    // await db thread to end...
    db_handle.join();
}

#[cfg(test)]

mod tests {
    use models::*;

    #[test]
    // a test function that returns our error result
    fn test_raises_no_id_provided()  {
        
        fn inner(yes: bool) -> Result<(), NoIDProvided> {
            if yes {
                Err(NoIDProvided::new("this is the error msg."))
            } else {
                Ok(())
            }        
        }

        // throw error
        // let out = try!(inner(true).map_err(|e| e.to_string()));
        // println!("OUT: {:?}", out);

        // don't
        // let out = try!(inner(false).map_err(|e| e.to_string()));
        // println!("OUT: {:?}", out);
    }

}

