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
mod models;
mod db;
mod pool;
mod schema;

use models::*;
use cache::*;
use db::save_posts;

use models::MessageType;
use std::rc::{Rc};
use std::sync::Arc;
use std::thread;

// use crossbeam_channel::{Receiver, Sender};

#[derive(Debug, Clone)]
struct GrandSocketStation {
    // represents the list of users
    connections: Vec<Connection>,
    // represents the resource that are being watched by users
    // watches: Vec<models::Resource>,
}

impl GrandSocketStation {
    pub fn get_connections(&self) -> &Vec<Connection> {
        return &self.connections;
    }
    pub fn push_connection(&mut self, conn: Connection) {
        return self.connections.push(conn);
    }

}

#[derive(Clone)]
struct Connection {
    // parent: Weak<Cell<GrandSocketStation>>,
    id: i32,
    tx: Sender,
    to_cache: crossbeam_channel::Sender<SafeArcMsg>,
    from_cache: crossbeam_channel::Receiver<SafeArcMsg>,
    kill_cache: crossbeam_channel::Sender<Cancel>,
}

impl fmt::Debug for Connection {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Connection ID: {}, sender: {}", self.id, self.tx.connection_id())
    }
}

#[derive(Serialize, Deserialize, Debug)]
enum IdOrPost {
    Id(i32),
    Post(models::Post),
}

#[derive(Serialize, Deserialize)]
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
                let json: Result<WSMessage ,serde_json::Error> = serde_json::from_str(&text); 
                let response: Result<Vec<Post>, String> = match json {
                    Ok(msg) => {
                        let msg_result: Result<Vec<Post>, String> = match msg.message {
                            MessageType::Get => self.handle_get_msg(msg),
                            MessageType::Create => self.handle_create_msg(msg),
                            MessageType::Watch => self.handle_watch_msg(msg),
                            MessageType::Update => self.handle_update_msg(msg),
                        };
                        msg_result
                    },
                    Err(e) => { Err(format!("There is a terrible error: {:?}", e )) },
                };
                let resp = response.expect("There was an error!");
                let serialized = serde_json::to_string(&resp).expect("Uh-oh... JSON serialization error!~");
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
                
            },
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
        let mut has_err = false;
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Get)
            .build();

        let mut p = Post::new();
        p.id = match msg.id {
            Some(id) => id,
            None => 0, // TODO: consider failing-fast here
        };
        
        wrap.items_mut().push(Arc::new(Resource::new(p)));

        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {},
            Err(e) => {
                has_err = true;
                println!("[Error] ---> {:?}", e);
            },
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => { val.items().clone() }, // @TODO: figure out how to avoid clone/copy
            Err(e) => { 
                println!("[Error] ---> {:?}", e);
                let ret: String = format!("Error receiving from channel (from cache).");
                // Err(e);
                let temp: Vec<ArcItem> = vec![];
                temp
            },
        };
        println!("resp: {:?}", resp);
        
        let output: Vec<Post> = resp.iter().map(|x| (*x.get_data()).clone()).collect();
        Ok(output)
    }
    fn handle_create_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Get)
            .build();

        let mut p = match msg.post {
            Some(post) => post,
            None => {
                // failt-fast
                return Err(String::from("No post was provided!"));
            },
        };
        
        wrap.items_mut().push(Arc::new(Resource::new(p)));
        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {
                println!("Sucessfully sent and got in return: {:?}", val);
            },
            Err(e) => {
                println!("There was an error communicating with the cache! Err: {:?}", e);
                return Err(String::from("There was an error communicating with the cache."));
            },
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => { val.items().clone() }, // @TODO: figure out how to avoid clone/copy
            Err(e) => { 
                println!("[Error] ---> {:?}", e);
                let ret: String = format!("Error receiving from channel (from cache).");
                // Err(e);
                let temp: Vec<ArcItem> = vec![];
                return Err(String::from("Error receiving from channel (from cache)."));
            },
        };
        println!("resp: {:?}", resp);

        let output: Vec<Post> = resp.iter().map(|x| (*x.get_data()).clone()).collect();
        Ok(output)
    }
    fn handle_update_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        unimplemented!()
    }
    fn handle_watch_msg(&self, msg: WSMessage) -> Result<Vec<Post>, String> {
        unimplemented!()
    }
}




// fn parse_message<T>(msg: String) ->  {

// }

fn main() {
    let p1 = models::Post::new();
    let resource = models::Resource::new(p1);
    let socket_station = GrandSocketStation {
        connections: vec!(),
    };
    let mut hub = Rc::new(socket_station);
    // let mut h = hub.clone();
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


    listen("127.0.0.1:3012", |out| {
        // println!("HUB: {:?}", h.into_inner());
        
        // println!("Hub WEAK --> {:?}", Rc::downgrade(&h));
        // let parent =  Rc::downgrade(&hub);
        // println!("WEAK: {:?}", parent);
        let res = Connection{ 
            id: *i, 
            tx: out, /*parent: Rc::downgrade(&hub)*/ 
            to_cache: a.clone(),
            from_cache: b.clone(),
            kill_cache: c.clone(),
        };
        let output = res.clone();
        println!("Strong count: {}", Rc::strong_count(&hub));
        match Rc::get_mut(&mut hub) {
            Some(val) => val.push_connection(output),
            None => panic!("Uh ohhhhhhh"),
        };

        // hub.connections.push(res);
        *i = *i + 1;
        
        // test send on all connections
        for conn in hub.get_connections() {
            let c: Connection = conn.clone();
            let result = c.tx.send("This is a test send.");
            match result {
                Ok(val) => val,
                Err(e) => println!("WS Send Error: {}", e),
            }
        }
        res
    }).unwrap();

    // await db thread to end...
    db_handle.join();
}
