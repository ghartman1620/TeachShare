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
extern crate ws;
#[macro_use]
extern crate serde_derive;

extern crate dotenv;
extern crate serde_json;
// #[macro_use]
// extern crate diesel;
// extern crate serde;
// extern crate serde_json;

#[macro_use]
extern crate crossbeam_channel;

#[macro_use]
extern crate diesel;

use std::fmt;
use ws::{listen, CloseCode, Error, Handler, Handshake, Message, Result, Sender};

mod cache;
mod models;
mod models_diesel;
mod pool;
mod schema;

use models::MessageType;
use std::rc::{Rc, Weak};
use std::cell::Cell;

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
    fn on_open(&mut self, hs: Handshake) -> Result<()> {
        // We have a new connection, so we increment the connection counter
        // .get_mut(&self.count.get()).get_or_insert(&mut hs.peer_addr.unwrap().ip());  // insert(self.count.get(), hs);
        //  self.connections[self.out.connection_id()] = self.out;

        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> Result<()> {
        // this is the Tx for where this data message came from

        let result = match msg {
            Message::Binary(bin) => {
                //println!("Received binary message")
                println!("{:?}", bin);
                panic!("Received binary message");
            } // ..
            Message::Text(text) => {
                println!("{}", text);
                let res = serde_json::from_str(&text);
                if res.is_err() {
                    println!("Badly formatted message: {}", text);
                } else {
                    let opt: Option<WSMessage> = res.ok();
                    if opt.is_none() {
                        println!("Message was deserialized into a None");
                    } else {
                        let message: WSMessage = opt.unwrap();
                        println!(
                            "message received: message: {:?}, id: {:?}, post: {:?}",
                            message.message, message.id, message.post
                        );
                    }
                }
            }
        };
        self.tx.send("Some text...")
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

// fn parse_message<T>(msg: String) ->  {

// }

fn main() {
    let post_s = "{\"user_id\":1,\"id\":10, \"content\": {}, \"title\" : \"abc123\"}";
    let res = serde_json::from_str(&post_s);
    assert!(res.is_ok());

    let opt: Option<models::Post> = res.ok();
    assert!(opt.is_some());

    println!("{:?}", opt.unwrap());

    let msg = WSMessage {
        message: MessageType::Get,
        id: Some(3),
        post: None,
    };
    let msg2 = WSMessage {
        message: MessageType::Create,
        id: None,
        post: Some(models::Post::new()),
    };

    let s: &'static str = "{\"message\":\"Get\"}";
    let res = serde_json::from_str(&s);
    assert!(res.is_ok());

    let opt: Option<WSMessage> = res.ok();
    assert!(opt.is_some());

    let msg = opt.unwrap();
    println!("Deserialized string:");
    println!("{:?} {:?} {:?}", msg.message, msg.id, msg.post);

    let serialized = serde_json::to_string(&msg).unwrap();
    println!("{}", serialized);
    let serialized2 = serde_json::to_string(&msg2).unwrap();
    println!("{}", serialized2);
    let pool = pool::ThreadPool::new(2).unwrap();
    println!("{:?}", pool);
    pool.execute(|| {
        println!("This is getting executed!");
    });

    // let users: HashMap<i32, models::User> = HashMap::new();
    // let mut hub = GrandSocketStation {
    //     user_pool: Cell::new(users),
    //     // watches: Vec::new(),
    // };

    let p = models::Post::new();
    let m = &mut models::Resource::<models::Post>::new(p);
    println!("Post: {:?}", m.data);

    m.add_watch(models::User::new());
    m.add_watch(models::User::new());
    let all = m.all_watchers();
    println!("All ---> {:?}", all);
    // let t = m.data;

    for (id, user) in m.watchers_to_iter() {
        println!("User [{}] --> {:?}", id, user);
    }

    let rm = match m.remove_watch(1) {
        Some(val) => println!("returned: {:?}", val),
        None => println!("Nothign was returned."),
    };
    println!("rm: {:?}", rm);
    println!("new watchers: {:?}", m.watchers);
    // t.id = 2;
    // t.username = String::from("bryandmc");
    m.increment();
    println!("Model: {:?}", m);

    // let cache = &mut models::Cache::new();
    let t = models::Post::new();
    // let old_result = cache.set_post(1, t);
    // let exists: bool = match old_result {
    //     None => true,
    //     Some(_) => false,
    // };
    // println!("Did exist? -> {}", exists);

    let t = models::Post::new();
    // let old_result = cache.set_post(1, t);
    // let exists: bool = match old_result {
    //     None => true,
    //     Some(_) => false,
    // };
    // println!("Did exist? -> {}", exists);
    // {
    //     let temp = match cache.get_post(1) {
    //         None => Err("key does not exist"),
    //         Some(val) => Ok(val),
    //     };
    //     let result = temp;
    // }
    let p1 = models::Post::new();
    let resource = models::Resource::new(p1);
    let socket_station = GrandSocketStation {
        connections: vec!(),
    };
    let mut hub = Rc::new(socket_station);
    // let mut h = hub.clone();
    let i = &mut 0;

    listen("127.0.0.1:3012", |out| {
        // println!("HUB: {:?}", h.into_inner());
        
        // println!("Hub WEAK --> {:?}", Rc::downgrade(&h));
        // let parent =  Rc::downgrade(&hub);
        // println!("WEAK: {:?}", parent);
        let res = Connection{ id: *i, tx: out, /*parent: Rc::downgrade(&hub)*/ };
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
}
