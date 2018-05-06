#[macro_use]
extern crate diesel;
extern crate dotenv;
extern crate serde_json;

pub mod models;
pub mod schema;

use models::*;


use std::sync::mpsc::{channel,Receiver};

use std::thread;
use std::time::SystemTime;





fn main() {
    let connection = establish_connection();

    let (tx, rx) = channel();
    let begin = SystemTime::now();

    let t = thread::spawn(move || {
        models::save_posts(rx);
    });
    let mut p: Post = Post::get(1, &connection).expect("no post 1");
    //we'll set p's title back to whatever it was once we're done
    let s = p.title.clone();
    let _ = tx.send(p.clone());
    for x in 0..1000  {
        p.title = format!("change{}", x); 
        tx.send(p.clone()).expect("Error sending post");
    }
    println!("i can continue doing useful work while posts are being saved!");
    p.title = s;
    tx.send(p.clone()).expect("Error sending post");
    drop(tx);
    let delta = SystemTime::now().duration_since(begin).expect("time went backwards");
    println!("Finished sending posts in time of {:?}", delta);
    let _ = t.join();
    let delta = SystemTime::now().duration_since(begin).expect("time went backwards");
    println!("Finished saving posts in time of {:?}", delta);
}


