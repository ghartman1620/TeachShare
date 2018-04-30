extern crate actix;

use actix::prelude::*;
use std::collections::HashMap;
use std::sync::mpsc::channel;
use std::sync::mpsc::{Receiver, Sender};
use std::sync::{Arc, RwLock};
use std::thread;

mod models;

pub struct WSActor {
    id: i64,
    addr: Recipient<Syn, GenericMessage>,
}

#[derive(Debug)]
pub struct GenericMessage {
    timestamp: i64,
    data: Vec<i64>,
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

fn produce(sender: Sender<String>) {
    // let pool = CpuPool::new_num_cpus();

    // for chunk in reader {
    //     let future = pool.spawn_fn(|| /* do work */);
    //     sender.send(future);
    // }

    // Dropping the sender signals there's no more work to consumer
}

fn consume(receiver: Receiver<String>) {
    while let Ok(future) = receiver.recv() {
        // let item = future.wait().expect("Computation Error?");

        /* do something with item */
    }
}

// fn addr_closure() ->

fn main() {
    // let (sender, reciever) = channel();

    // This is a way to have a thread safe mutux-backed, reference counted
    // hash map. So yeah..
    // let mut themap: HashMap<String, Addr<Syn, _>> = HashMap::new();
    // themap.insert(String::from("test"), 10);

    // let lock = RwLock::new(&themap);

    // let refcounter: Arc<RwLock<&HashMap<String, Addr<Syn, _>>>> = Arc::new(lock);
    // let refcounter2 = refcounter.clone();
    // .insert(String::from("test"), 10);
    // {
    //     let result = refcounter.write().unwrap()["test"];
    //     // assert_eq!(*result, HashMap::new());
    //     let v = result;
    //     //println!("{:?}", v);
    // }

    // let mut hm: HashMap<String, Addr<Syn, _>> = HashMap::new();
    // let (sen, rec) = channel();
    let mut handles: Vec<std::thread::JoinHandle<()>> = vec!(); 

    for _ in 0..10 {
        let handle = thread::spawn(|| {
            let system = actix::System::new("test");
            let addr2: Addr<Syn, _> = WSActor::create(|ctx| {
                let addr: Addr<Syn, _> = ctx.address();
                let addr2: Addr<Syn, _> = WSActor::new(0, addr.recipient()).start();

                let add_copy = addr2.clone();

                // let localnum = Arc::get_mut(&mut refcounter2).unwrap();

                // localnum.insert(String::from("test"), add_copy);
                // println!("{:?}", localnum);
                // sen.send(refcounter2.read().unwrap()).unwrap();
                addr2.do_send(GenericMessage {
                    timestamp: 10,
                    data: vec![],
                });
                WSActor::new(2, addr2.recipient())
            });
            system.run();
        });
        handles.push(handle);
    }
    println!("{:?}", handles);
    // println!("{:?}", reciever.recv().unwrap());

    //println!("{:?}", hm);
    // let hm = rec.recv().unwrap();

    // for (k, val) in hm {
    //     println!("Have key: {} ---> {}", k, val.connected());
    // }
    // // assert!(handle.join().is_ok());
    // let good = handle.join();
    // if good.is_ok() {
    //     println!("Joined threads successfully!");
    // }

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
