// A WebSocket echo server

extern crate ws;

use ws::listen;

fn main() {
    listen("127.0.0.1:3012", |out| {
        move |msg| {
            println!(msg);
            out.send(msg);
        }
    }).unwrap()
} 