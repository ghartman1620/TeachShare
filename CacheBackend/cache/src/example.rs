extern crate actix;
extern crate futures;
use futures::{future, Future};
use actix::*;

// this is our Message
struct Sum(usize, usize);

// we have to define the response type for `Sum` message
impl Message for Sum {
    type Result = usize;
}

// Actor definition
struct Summator;

impl Actor for Summator {
    type Context = Context<Self>;
}

// now we need to define `MessageHandler` for the `Sum` message.
impl Handler<Sum> for Summator {
    type Result = usize;   // <- Message response type

    fn handle(&mut self, msg: Sum, ctx: &mut Context<Self>) -> Self::Result {
        msg.0 + msg.1
    }
}

fn main() {
    let system = System::new("test");

    let addr: Addr<Unsync, _> = Summator.start();
    let res = addr.send(Sum(10, 5));  // <- send message and get future for result
    
    system.handle().spawn(res.then(|res| {
        match res {
            Ok(result) => println!("SUM: {}", result),
            _ => println!("Something wrong"),
        }
        
        Arbiter::system().do_send(msgs::SystemExit(0));
        future::result(Ok(()))
    }));

    system.run();
}