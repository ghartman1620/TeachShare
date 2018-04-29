#[macro_use] extern crate actix;
use std::sync::mpsc::channel;
use std::thread;
use std::collections::HashMap;

// use actix::{Actor, Addr, Arbiter, Handler, Context, msgs, Message, Unsync, Recipient};
// use futures::{future, Future};
use actix::prelude::*;
use std::sync::Mutex;

 // <actix::Syn, WSActor, GenericMessage>;

pub struct User {
    pub pk: i64,
    pub username: String,
    pub email: String,
    // etc..

    // assumes the value for a watch is a string temporarily
    pub watches: Vec<Watch<String>>, 
}

pub enum WatchType {
    Post,
    PostList,
    UserProfile,
    // etc...
}

// Model + Field which are used to define what in Django's models is being watched.
// This is really just a placeholder for the general idea.
pub struct Model {}
pub struct Field {}

pub struct WatchValue {
    model: Model,
    field: Field,
    identifiers: Vec<String>,
}

pub struct Watch<V> {
    pub id: i64, // the ID of the WATCH, not the thing being watched
    pub watch_type: WatchType,
    pub value: V, // will depend on what kind of value you are watching
}

pub struct ConnRef {
    pub user: User,
}

pub struct Nexus {
    pub id: i8, // not gonna be many if even more than 1
    pub users: Vec<User>,
    pub connections: HashMap<i32, ConnRef>,
}

pub struct WSActor{
    id: i64,
    addr: Recipient<Syn, GenericMessage>,

}

#[derive(Debug)]
pub struct GenericMessage {
    timestamp: i64,
    data: Vec<i64>
}

impl WSActor {
    pub fn new(_id: i64, _addr: Recipient<Syn, GenericMessage>) -> WSActor {
        WSActor {
            id: _id,
            addr: _addr,
        }
    }
}

impl Message for GenericMessage {
    type Result = ();
}

// struct testFuture {}

// impl Future for testFuture {
//     type Item{};
//     type Error{};

//     fn poll(&mut self) -> Result<Async<Self::Item>, Self::Error> {
//         ()
//     }
// }

impl Actor for WSActor {
    type Context = Context<WSActor>;

    fn started(&mut self, ctx: &mut Self::Context) {
        println!("starting WSActor...");
    }
}

impl Handler<GenericMessage> for WSActor {
    type Result = ();

    fn handle(&mut self, msg: GenericMessage, ctx: &mut Context<Self>) -> Self::Result {

        println!("{:?}", msg.data);
        ()
    } 
}

// fn addr_closure() -> 

fn main() {
    // println!("Hello, world!");
    // let (sender, reciever) = channel();
    
    // use futures::{future, Future};

    let mut hm: HashMap<String, Addr<Syn, _>> = HashMap::new();
    let (sen, rec) = channel();
    // let a: WSActor = WSActor{};
    // let a = WSActor::new(1, String::from("fake"));
    // hm.insert(String::from("test"), a);
    
    let handle = thread::spawn(||{
        let system = actix::System::new("test");
        let addr2: Addr<Syn, _> = WSActor::create(move |ctx| {
            let addr: Addr<Syn, _> = ctx.address();
            let addr2: Addr<Syn, _> = WSActor::new(0, addr.recipient()).start();
            
            let add_copy = addr2.clone();

            hm.insert(String::from("test"), add_copy);
            sen.send(hm).unwrap();        
            addr2.do_send(GenericMessage{timestamp: 10, data: vec!()});
            WSActor::new(2, addr2.recipient())
        });
        system.run();
    });
    
    // println!("{:?}", reciever.recv().unwrap());
    
    
    //println!("{:?}", hm);
    let hm = rec.recv().unwrap();

    for (k, val) in hm {
        println!("Have key: {} ---> {}", k, val.connected());
    }
    // assert!(handle.join().is_ok());
    let good = handle.join();
    if good.is_ok() {
        println!("Joined threads successfully!");
    }

    // let addr: Addr<Unsync, _> = WSActor::new(2, String::from("fake")).start();
    // println!("Is connected?: {}", addr.connected());
    // let m: GenericMessage = GenericMessage{timestamp: 10, data: vec!()};

    // let res = addr.send(m);
    // let addr2 = WSActor::new(3, String::from("fake"))
    
    // system.handle().spawn(res.then(|res| {
    //     match res {
    //         Ok(result) => println!("Result: {}", result),
    //         _ => println!("Nothing :("),
    //     }

    //     Arbiter::system().do_send(msgs::SystemExit(0));
    //     return future::result(Ok(()));
    // }));
    // // send();
    
}
