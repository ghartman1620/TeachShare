extern crate ws;
#[macro_use]
extern crate serde_derive;

// #[macro_use]
// extern crate diesel;
// extern crate serde;
// extern crate serde_json;

#[macro_use]
extern crate crossbeam_channel;

use std::cell::Cell;
use std::collections::HashMap;
use std::sync::*;

use ws::{listen, CloseCode, Error, Handler, Handshake, Message, Result, Sender};
use std::thread;

mod models;
mod pool;
mod cache;

// use crossbeam_channel::{Receiver, Sender};

// struct GrandSocketStation {
//     // represents the list of users
//     user_pool: Cell<HashMap<models::User, Node<String>>>,
//     // represents the resources that are being watched by users
//     // watches: Vec<models::Resource>,
// }

#[derive(Clone)]

struct Node<T> {
    tx: mpsc::Sender<T>,
    out: Sender,
}

impl<T> Handler for Node<T> {
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
                println!("{:?}", bin); 
                String::from("")
            }, // ...
            Message::Text(text) => { 
                println!("{}", text);
                text    
            },
        };
        
        self.out.send("Some text...")
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away => println!("The client is leaving the site."),
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
    println!("new watchers: {:?}", m.watchers);
    // t.id = 2;
    // t.username = String::from("bryandmc");
    m.increment();
    println!("Model: {:?}", m);
    
    let cache = &mut models::Cache::new();
    let t = models::Post::new();
    let old_result = cache.set_post(String::from("something"), t);
    let exists: bool = match old_result {
        None => true,
        Some(_) => false,
    };
    println!("Did exist? -> {}", exists);
    
    let t = models::Post::new();
    let old_result = cache.set_post(String::from("something"), t);
    let exists: bool = match old_result {
        None => true,
        Some(_) => false,
    };
    println!("Did exist? -> {}", exists);
    {
        let temp = match cache.get_post(String::from("something")) {
            None => Err("key does not exist"),
            Some(val) => Ok(val),
        };
        let result = temp;
    }
    let p1 = models::Post::new();
    let resource = models::Resource::new(p1);
    
    // let mut_resource = resource;

    let temp2 = cache.update_post(String::from("something"), resource);

    println!("Result from update: {:?}", temp2);
    println!("{:?}", cache);
    // handle.join().unwrap();
    listen("127.0.0.1:3012", |out| {
        let (send, _) = mpsc::channel();
        let res = Node::<String> { out: out, tx: send }.clone();
        let output = res.clone();

        // Store a copy of the user/connection
        // hub.user_pool
        //     .get_mut()
        //     .entry(models::User {
        //         pk: 1,
        //         email: String::from(""),
        //         username: String::from(""),
        //     })
        //     .or_insert(res);

        // println!("{:?}", hub.watches);
        return output;
    }).unwrap();
}
