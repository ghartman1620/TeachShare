// extern crate crossbeam;

use crossbeam_channel::{Receiver, Sender};
use crossbeam_channel::unbounded;
use std::thread;
use std::thread::JoinHandle;
use models;

pub fn main() {
    println!("Yay!!");
    let (send, recv) = unbounded::<models::Message<models::Post>>();
    let handle = thread::spawn(move || {
        for msg in recv.recv() {
            println!("{:?}", msg);
        }
    });
    let m = models::Message::<models::Post> {
        data: models::Post::new(),
        msg_type: models::MessageType::Get,
        timestamp: 0,
        version: [0, 0, 0],
    };
    let result = send.send(m);
    println!("got back: {:?}", result.unwrap());
}

// separate function so that if there is necessary logic it'll happen here and not
// in the cache_looper method where it'll be called.
pub fn build_cache() -> models::Cache {
    let cash = models::Cache::new();
    cash
}

pub fn cache_looper(messages: Receiver<models::Message<models::Post>>, control: Receiver<models::Command<String>>) -> JoinHandle<()> {
    let mut cash = build_cache();
    
    let handle = thread::spawn(move || {
        println!("Starting cache loop...");
        loop {
            print!("*");
            select_loop! {
                recv(messages, msg) => handle_message(msg, &mut cash),
                recv(control, cmd) => handle_command(cmd),
            }
        }
    });
    handle
}

fn handle_message<T>(msg: models::Message<T>, cash: &mut models::Cache) where T: models::Model {
    println!("recived message [{:?}]: {:?}", msg.msg_type, msg.version);
    // do something with message
    // @TODO: pick up here...
    cash.set_post(msg.data.id(), msg.data);
}

fn handle_disconnect() {
    println!("A channel disconnected!");
}

fn handle_command(cmd: models::Command<String>) {
    let matched = match cmd.cmd_type {
        models::CommandType::Exit => {
            println!("Got exit command");
            true
        },
        _ => false,
    };
}

#[cfg(test)]
mod tests {
    use models;
    use cache;
    use std::time::Duration;
    use std::thread;

    extern crate crossbeam_channel;

    #[test]
    fn test_select() {
        let (msg_send, msg_recv) = crossbeam_channel::unbounded::<models::Message<models::Post>>();
        let (cmd_send, cmd_recv) = crossbeam_channel::unbounded::<models::Command<String>>();
        let handle = cache::cache_looper(msg_recv, cmd_recv);
        
        let second = thread::spawn(move || {
             let m = models::Message::<models::Post> {
                data: models::Post::new(),
                msg_type: models::MessageType::Get,
                timestamp: 0,
                version: [0, 0, 0],
            };
            let s1 = msg_send.send(m);

            println!("Error for #1 ? --> {}", s1.is_err());
            println!("Finished 1 second sleep...");
            let n = models::Command::<String> {
                cmd_type: models::CommandType::Exit,
                value: String::from(""),
            };
            let s2 = cmd_send.send(n);
            println!("Error for #1 ? --> {}", s2.is_err());
            match s2 {
                Ok(val) => println!("{:?}", val),
                Err(e) => println!("{:?}", e),
            }
        });
        second.join().unwrap();
    }

    #[test]
    fn test_msg_handler() {

    }
    
} 