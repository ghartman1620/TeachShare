
extern crate actix;
extern crate futures;

use actix::prelude::*;
use futures::future::Future;
use actix::ContextFutureSpawner;
use actix::dev::Request;
use std::thread;



/// Define `Ping` message
#[derive(Copy, Clone)]
struct Ping(usize);

///impl Copy for Ping { }
impl Message for Ping {
    type Result = usize;
}



/// Actor
struct MyActor {
    count: usize,
}

/// Declare actor and it's context
impl Actor for MyActor {
    type Context = Context<Self>;
}


//director should maintain a list of other actors and ping them all when it receives a ping.
struct Director {
    actors: Vec<Addr<Unsync, MyActor>>,
    responses: Vec<Request<Unsync, MyActor, Ping>>
}

impl Actor for Director {
    type Context = Context<Self>;
}

impl Handler<Ping> for Director {
    type Result = usize;

    fn handle(&mut self, msg: Ping, _: &mut Context<Self>) -> Self::Result {
        println!("I'm the director! I got message {}", msg.0);
        for actor in &self.actors{
            
            //println!("actor {}", actor.count);

            let res = actor.send(msg);
            self.responses.push(res); //this is a bad way to store requests. 
            //they need to be stored because when a request is dropped it's cancelled,
            //so what really ought to happen is a thread should be opened that holds the 
            //request until its done. But for some reason Rust isn't happy with the
            //wait() and then() methods defined on request.
        }
        msg.0
    }
}


/// Handler for `Ping` message
impl Handler<Ping> for MyActor {
    type Result = usize;
    
    fn handle(&mut self, msg: Ping, _: &mut Context<Self>) -> Self::Result {
        self.count += msg.0;
        println!("I'm an actor! I got message {}", msg.0);
        self.count
    }
}




fn main() {
    // start system, this is required step
    let system = System::new("test");
    
    // start new actor
    let addr: Addr<Unsync, MyActor> = MyActor { count: 10 }.start();
    let addr1: Addr<Unsync, MyActor> = MyActor {count: 15 }.start();
    let mut vec = Vec::new();
    vec.push(addr);
    vec.push(addr1);
    let director: Addr<Unsync, Director> = Director {actors: vec, responses: Vec::new()}.start();
    // send message and get future for result
    let _res = director.send(Ping(10));

    
    system.run();
}
