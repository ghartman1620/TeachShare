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
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;

#[derive(Debug, Clone)]
struct GrandSocketStation {
    // represents the list of users
    connections: Vec<Rc<Connection>>,
    // represents the resource that are being watched by users
    // watches: Vec<models::Resource>,
}

impl GrandSocketStation {
    pub fn get_connections(&self) -> &Vec<Rc<Connection>> {
        &self.connections
    }
    pub fn get_connections_mut(&mut self) -> &mut Vec<Rc<Connection>> {
        &mut self.connections
    }
    pub fn push_connection(&mut self, conn: Connection) {
        self.connections.push(Rc::new(conn))
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
    to_cache: crossbeam_channel::Sender<Arc<Msg>>,
    from_cache: crossbeam_channel::Receiver<Arc<Msg>>,
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

pub type Version = u64;
pub type ID = i32;

#[derive(Serialize, Deserialize, Debug)]
struct WSMessage {
    message: MessageType,
    id: Option<i32>,
    post: Option<models::Post>, //id_or_post: IdOrPost
    manifest: Option<Vec<IdAndVersion>>,
    version: Option<u64>,
}

impl Handler for Connection {
    fn on_open(&mut self, hs: Handshake) -> ws::Result<()> {
        println!("client connected");
        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> ws::Result<()> {
        let result = match msg {
            Message::Binary(bin) => {
                println!("{:?}", bin);
                panic!("Received binary message");
            } // ..
            Message::Text(text) => {
                println!("RC: {:?}", self.parent);
                match &mut self.parent {
                    Some(val) => {
                        match val.try_borrow_mut() {
                            Ok(parent) => {
                                println!("OK: {:?}", parent);
                                println!("connections: {:?}", parent.connections);
                                println!("connection count: {}", parent.connections.len());
                                for c in &parent.connections {
                                    println!("Connection --> {:?}", c);
                                    // println!("Sender: {:?}", c.tx);
                                }
                            }
                            Err(e) => println!("Error: {:?}!", e),
                        }
                    }
                    None => println!("None. Did not unwrap."),
                }
                let json: Result<WSMessage, serde_json::Error> = serde_json::from_str(&text);
                let response: Option<String> = match json {
                    Ok(msg) => {
                        let msg_result = match msg.message {
                            MessageType::Get => self.handle_get_msg(msg),
                            MessageType::Create => self.handle_create_msg(msg),
                            MessageType::Watch => self.handle_watch_msg(msg),
                            MessageType::Update => self.handle_update_msg(msg),
                            MessageType::Manifest => self.handle_manifest_msg(msg),
                        };
                        msg_result
                    }
                    Err(e) => Some(format!(
                        "There is a terrible error parsing {:?}: {:?}",
                        text, e
                    )),
                };
                match response {
                    Some(error_msg) => println!("Final error: {:?}", error_msg),
                    _ => {}
                }
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
                                    exiting_connection_id = parent
                                        .connections
                                        .clone()
                                        .into_iter()
                                        .position(|x| x.tx.connection_id() == old_connection_id)
                                        .unwrap();
                                }
                                parent.connections.remove(exiting_connection_id);
                                for c in &parent.connections {
                                    println!("Connection --> {:?}", c);
                                }
                            }
                            Err(e) => println!("Error: {:?}!", e),
                        }
                    }
                    None => println!("None. Did not unwrap."),
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
    fn serialize_and_send_posts(&self, data: &[Model]) -> Result<(), ws::Error> {
        let serialized = serde_json::to_string(data).expect("Uh-oh... JSON serialization error!~");
        println!("Serialized content: {}", serialized);
        self.tx.send(serialized)
    }

    fn handle_get_msg(&self, msg: WSMessage) -> Option<String> {
        println!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Get);
        let mut return_message = Msg::new()
            .set_msg_type(MessageType::Get)
            .build();

        let mut p = Post::new();
        p.id = match msg.id {
            Some(id) => id,
            None => return Some(String::from("No Post ID provided.")),
        };

        return_message.items.push(Arc::new(Resource::new(Model::Post(p))));

        match self.to_cache.send(Arc::new(return_message)) {
            Ok(val) => {}
            Err(e) => {
                println!("[Error] ---> {:?}", e);
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val.items.clone(), // @TODO: figure out how to avoid clone/copy
            Err(e) => {
                println!("[Error] ---> {:?}", e);
                let ret: String = format!("Error receiving from channel (from cache).");
                return Some(ret);
            }
        };
        println!("resp: {:?}", resp);

        let resp_data: Vec<Model> = resp.iter().map(|x| x.data.clone()).collect();
        match self.serialize_and_send_posts(resp_data.as_slice()) {
            Ok(o) => None,
            Err(e) => Some(format!("Err: {:?}", e)),
        }
    }
    fn handle_create_msg(&self, msg: WSMessage) -> Option<String> {
        None
    //     println!("[MAIN] received: {:?}", msg.message);
    //     assert_eq!(msg.message, MessageType::Create);
    //     let mut wrap = Msg::new()
    //         .set_msg_type(MessageType::Create)
    //         .build();

    //     let p = match msg.post {
    //         Some(post) => post,
    //         None => {
    //             // fail-fast
    //             return Some(String::from("No post was provided!"));
    //         }
    //     };

    //     wrap.items_mut().push(Arc::new(Resource::new(Model::Post(p))));
    //     match self.to_cache.send(Arc::new(wrap)) {
    //         Ok(val) => {
    //             println!("Sucessfully sent and got in return: {:?}", val);
    //         }
    //         Err(e) => {
    //             println!(
    //                 "There was an error communicating with the cache! Err: {:?}",
    //                 e
    //             );
    //             return Some(String::from(
    //                 "There was an error communicating with the cache.",
    //             ));
    //         }
    //     };

    //     let resp = match self.from_cache.recv() {
    //         Ok(val) => val.items.clone(), // @TODO: figure out how to avoid clone/copy
    //         Err(e) => {
    //             return Some(String::from("Error receiving from channel (from cache)."));
    //         }
    //     };
    //     println!("resp: {:?}", resp);

    //     let output: Vec<Post> = resp.iter().map(|x| (*x.data).clone()).collect();
    //     match self.serialize_and_send_posts(output.as_slice()) {
    //         Ok(o) => None,
    //         Err(e) => Some(format!("Err: {:?}", e)),
    //     }
    }

    fn handle_manifest_msg(&self, msg: WSMessage) -> Option<String> {
        None
    //     println!("[MAIN] received: {:?}", msg.message);
    //     assert_eq!(msg.message, MessageType::Manifest);

    //     let post_versions = match msg.manifest {
    //         Some(post_versions) => post_versions,
    //         None => return Some(String::from("No manifest was provided")),
    //     };
    //     if post_versions.len() == 0 {
    //         let posts = vec![];
    //         self.serialize_and_send_posts(posts.as_slice());
    //         return None;
    //     } else {
    //         println!("manifest: {:?}", post_versions);
    //         let mut wrap = Msg::new()
    //             .set_msg_type(MessageType::Manifest)
    //             .build();
    //         for post_version in post_versions {
    //             println!(
    //                 "[MAIN] manifest handler: adding post id {} version {} to cache list",
    //                 post_version.id, post_version.version
    //             );
    //             let mut p = Post::new();
    //             p.id = post_version.id;
    //             let mut resource = Resource::new(Model::Post(p));
    //             resource.version = post_version.version;
    //             wrap.items.push(Arc::new(resource));
    //         }
    //         println!("{:?}", wrap.items());
    //         match self.to_cache.send(Arc::new(wrap)) {
    //             Ok(val) => {
    //                 println!("Sucessfully sent and got in return: {:?}", val);
    //             }
    //             Err(e) => {
    //                 println!(
    //                     "There was an error communicating with the cache! Err: {:?}",
    //                     e
    //                 );
    //                 return Some(String::from(
    //                     "There was an error communicating with the cache.",
    //                 ));
    //             }
    //         };

    //         let resp = match self.from_cache.recv() {
    //             Ok(val) => val.items.clone(),
    //             Err(e) => {
    //                 return Some(String::from("Error receiving from channel (from cache)."));
    //             }
    //         };
    //         println!("[MAIN] resp: {:?}", resp);
    //         let output: Vec<Option<Post>> = resp.iter().map(|post| {
    //             match post.data {
    //                 Model::Post(p) => Some(p),
    //                 _ => None,
    //             }
    //         }).filter(|post| post.is_some())
    //             .map(|post| post.unwrap())
    //             .collect();
    //         match self.serialize_and_send_posts(output.as_slice()) {
    //             Err(e) => Some(format!("Error: {:?}", e)),
    //             _ => None,
    //         }
    //     }
    }
    fn handle_update_msg(&mut self, msg: WSMessage) -> Option<String> {
        None
    //     println!("[MAIN] received: {:?}", msg.message);
    //     assert_eq!(msg.message, MessageType::Update);
    //     let mut wrap = Msg::new()
    //         .set_msg_type(MessageType::Update)
    //         .build();

    //     // does the request have a Post ID?
    //     let post = match msg.post {
    //         Some(post) => post,
    //         None => {
    //             // fail-fast
    //             return Some(String::from("No post ID was provided!"));
    //         }
    //     };
    //     {
    //         wrap.items_mut().push(Arc::new(Resource::new(Model::Post(Post::new()))));
    //     }
    //     println!("WRAP: {:?}", wrap.items());

    //     match self.to_cache.send(Arc::new(wrap)) {
    //         Ok(val) => {
    //             println!("Sucessfully sent and got in return: {:?}", val);
    //         }
    //         Err(e) => {
    //             println!(
    //                 "There was an error communicating with the cache! Err: {:?}",
    //                 e
    //             );
    //         }
    //     };
    //     let changes = match self.from_cache.recv() {
    //         Ok(val) => Ok(val.items.clone()),
    //         Err(e) => Err(String::from("Error receiving from channel (from cache).")),
    //     };

    //     // @TODO: This is the actual update sending code. Could be optimized greatly.
    //     if let Ok(updated_data) = changes {
    //         let (watchers, posts): (Vec<Vec<i32>>, Vec<Post>) = updated_data
    //             .iter()
    //             .map(|x| (x.watchers.clone(), x.data.clone()))
    //             .unzip();

    //         // @TODO: This could be simplified somewhat or abstracted into functions/parts
    //         match &mut self.parent {
    //             Some(val) => match val.try_borrow_mut() {
    //                 Ok(parent) => {
    //                     for c in &parent.connections {
    //                         println!("Connection --> {:?}", c);
    //                         let id = c.tx.connection_id();
    //                         if let Some(matched_connection) =
    //                             watchers.iter().flat_map(|y| y).find(|x| **x == id as i32)
    //                         {
    //                             let serialized = serde_json::to_string(&posts)
    //                                 .expect("Uh-oh... JSON serialization error!~");

    //                             println!("Serialized content (Update): {}", serialized);
    //                             let send_result = c.tx.send(serialized);
    //                             if send_result.is_err() {
    //                                 return Some(format!("Error: {:?}", send_result.unwrap_err()));
    //                             }
    //                             return None;
    //                         } else {
    //                             println!("There was no matched connection for: {}. It does not need to be updated.", id);
    //                         }
    //                     }
    //                 }
    //                 Err(e) => println!("Error: {:?}!", e),
    //             },
    //             None => println!("None. Did not unwrap."),
    //         }
    //     }
    //     None
    }
    fn handle_watch_msg(&self, msg: WSMessage) -> Option<String> {
        None
    //     println!("[MAIN] received: {:?}", msg.message);
    //     assert_eq!(msg.message, MessageType::Watch);
    //     let mut wrap = Msg::new()
    //         .set_msg_type(MessageType::Watch)
    //         .build();

    //     // does the request have a Post ID?
    //     let post_id = match msg.id {
    //         Some(post_id) => post_id,
    //         None => {
    //             // fail-fast
    //             return Some(String::from("No post ID was provided!"));
    //         }
    //     };
    //     let mut post = Post::new();
    //     post.id = post_id;
    //     let mut resource = Resource::new(Model::Post(Post::new()));

    //     let token = self.tx.token();
    //     let conn_id = self.tx.connection_id();
    //     println!("TOKEN: {:?}", token.0);
    //     println!("Connection ID: {:?}", conn_id);
    //     println!("Post ID: {:?}", post_id);

    //     // add watch to resource
    //     resource.add_watch(conn_id as i32);
    //     wrap.connection_id = conn_id as i32;

    //     // wrap it up and send
    //     wrap.items.push(Arc::new(resource));
    //     match self.to_cache.send(Arc::new(wrap)) {
    //         Ok(val) => {
    //             println!("Sucessfully sent and got in return: {:?}", val);
    //         }
    //         Err(e) => {
    //             println!(
    //                 "There was an error communicating with the cache! Err: {:?}",
    //                 e
    //             );
    //             return Some(String::from(
    //                 "There was an error communicating with the cache.",
    //             ));
    //         }
    //     };

    //     let resp = match self.from_cache.recv() {
    //         Ok(val) => val.items.clone(), // @TODO: figure out how to avoid clone/copy
    //         Err(e) => {
    //             return Some(String::from("Error receiving from channel (from cache)."));
    //         }
    //     };
    //     println!("resp: {:?}", resp);

    //     let output = vec![];
    //     match self.serialize_and_send_posts(output.as_slice()) {
    //         Ok(o) => None,
    //         Err(e) => Some(format!("Err: {:?}", e)),
    //     }
    }
}

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
        crossbeam_channel::Sender<Arc<Msg>>,
        crossbeam_channel::Receiver<Arc<Msg>>,
        crossbeam_channel::Sender<Cancel>,
    ) = wire_up(send_db);

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
        h.push_connection(conn.clone());
        let value: Option<Connection> = Some(conn.clone());
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
    fn test_raises_no_id_provided() {
        fn inner(yes: bool) -> Result<(), NoIDProvided> {
            if yes {
                Err(NoIDProvided::new("this is the error msg."))
            } else {
                Ok(())
            }
        }
    }

}
