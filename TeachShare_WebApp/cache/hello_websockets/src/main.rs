extern crate actix;
extern crate actix_web;
extern crate serde;
extern crate serde_json;

#[macro_use]
extern crate serde_derive;

use actix::*;
use actix_web::*;


#[derive(Serialize, Deserialize, Debug)]
struct Post {
    pk: i32,
    comments: Vec<i32>,
    user: User,
}

#[derive(Serialize, Deserialize, Debug)]
struct User {
    pk: i32
}

struct Ws;

impl Actor for Ws {
    type Context = ws::WebsocketContext<Self>;
}

/// do websocket handshake and start `MyWebSocket` actor
fn ws_index(r: HttpRequest) -> Result<HttpResponse, Error> {
    let req = &mut r.clone();
    let pool = &mut req.cpu_pool();
    println!("{:?}", pool);
    ws::start(r, Ws)
}

impl StreamHandler<ws::Message, ws::ProtocolError> for Ws {

    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        println!("WS: {:?}", msg);
        match msg {
            ws::Message::Ping(msg) => ctx.pong(&msg),
            ws::Message::Text(text) => {
                let res = parse(text);
                ();
            },
            ws::Message::Binary(bin) => ctx.binary(bin),
            ws::Message::Close(_) => {
                ctx.stop();
            }
            _ => (),
        }
        println!("{:?}", ctx.state());
    }
}

fn parse(msg: String) -> Post {
    println!("Parse: {:?}", msg);
    let deserialized: Post = serde_json::from_str(&msg).unwrap();
    println!("deserialized = {:?}", deserialized);
    return deserialized;
}

fn main() {
    let sys = actix::System::new("ws-example");

    server::new(
        || App::new()
            // enable logger
            .middleware(middleware::Logger::default())
            // websocket route
            .resource("/ws/", |r| r.method(http::Method::GET).f(ws_index)))
            // // static files
            // .handler("/", fs::StaticFiles::new("static/")
            //          .index_file("index.html")))
        // start http server on 127.0.0.1:8080
        .bind("127.0.0.1:7000").unwrap()
        .start();

    println!("Started http server: 127.0.0.1:7000");
    let _ = sys.run();
}