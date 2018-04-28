extern crate actix;
use actix::{msgs, Actor, Addr, Arbiter, Context, Syn, System};

struct MyActor;

impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, _ctx: &mut Self::Context) {
       println!("I am alive!");
       Arbiter::system().do_send(msgs::SystemExit(0));
    }
}

fn main() {
    let system = System::new("test");

    let _addr: Addr<Syn, _> = MyActor.start();

    system.run();
}