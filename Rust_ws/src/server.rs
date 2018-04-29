extern crate ws;

use ws::{listen, Handler, Sender, Result, Message, Handshake, CloseCode};

struct Server {
    out: Sender,
}

impl Handler for Server {
    fn on_open(&mut self, shake: Handshake) -> Result<()> {
        println!("connected. request: {} response: {}", shake.request, shake.response);
        println!("");
        println!("origin: {} ", shake.request.origin().unwrap().unwrap());
        let x: Result<()> = self.out.send("Hello!");
        assert!(x.is_ok());
        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> Result<()> {
        // Echo the message back
        println!("send msg: {}", msg);
        // println!("send token {}", self.out.token());
        self.out.send(msg) //the result<()> returned by self.out.broadcast is returned by this on_message function
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        // The WebSocket1 protocol allows for a utf8 reason for the closing state after the
        // close code. WS-RS will attempt to interpret this data as a utf8 description of the
        // reason for closing the connection. I many cases, `reason` will be an empty string.
        // So, you may not normally want to display `reason` to the user,
        // but let's assume that we know that `reason` is human-readable.
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away   => println!("The client is leaving the site."),
            _ => println!("The client encountered an error: {}", reason),
        }
    }
}

fn main() {
  listen("127.0.0.1:3012", |out| Server { out: out } ).unwrap()
} 