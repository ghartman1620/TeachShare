extern crate crossbeam_channel;
use crossbeam_channel::{Receiver, Sender};
use models::{Item, MessageType, ModelType, Msg, Resource, Wrapper, PostResource, Post};
use pool;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use std::thread::JoinHandle;
use std::time::Duration;
use diesel::pg::PgConnection;

use diesel::prelude::*;
use diesel::result;
use db;

const MAX_DB_SAVE_TIMEOUT: Duration = Duration::from_millis(200);

pub type SafeArcMsg = Arc<Msg<'static> + Send + Sync>;
// type PostResource = Resource<Post>;


pub fn cache_thread(
    in_pipe: Receiver<SafeArcMsg>,
    ret_pipe: Sender<SafeArcMsg>,
    cancel: Receiver<Cancel>,
    db_send: Sender<Post>,
) {
    thread::spawn( move || {
        let mut cache = Rc::new(RefCell::new(HashMap::<i32, Resource<Post>>::new())); // Rc::new(Cache::new());
        loop {
            // println!("Strong count: {}.", Rc::strong_count(&cache));
            let conn: PgConnection = db::establish_connection();
            select_loop! {
                recv(in_pipe, msg) => {
                    let m = msg.clone();
                    let response = match msg.msg_type() {
                        MessageType::Get => {
                            println!("Msg: {:?}", msg.msg_type());
                            let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                            let res = handle_get(msg, c, &ret_pipe, &conn);

                        },
                        MessageType::Create => {
                            println!("Msg: {:?}", msg.msg_type());
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_create(msg, c, &ret_pipe, &db_send);
                            }
                            println!("Value: {:?}", cache);
                        },
                        MessageType::Watch => {
                            println!("Msg: {:?}", msg.msg_type());
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_watch(msg, c, &ret_pipe);
                            }
                            println!("Value: {:?}", cache);
                        },
                        MessageType::Update => {
                            println!("Msg: {:?}", msg.msg_type());
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_update(msg, c, &ret_pipe);
                            }
                            println!("Value: {:?}", cache);
                        }
                    };


                    // let ret_resp = ret_pipe.send(response).unwrap();
                },
                recv(cancel, s) => {
                    println!("Cancel Message: {:?}", s);
                    return;
                }
            }
        }
    });
}

type RcCellHash<T> = Rc<RefCell<HashMap<i32, Resource<T>>>>;

#[allow(dead_code)]
/// wire_up uses the types to setup crossbeam channels and returns the relevant information
pub fn wire_up<'a>(db_send: Sender<Post>) -> (Sender<SafeArcMsg>, Receiver<SafeArcMsg>, Sender<Cancel>) {
    let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<SafeArcMsg>();
    let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<SafeArcMsg>();
    let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<Cancel>();
    let _sel = cache_thread(recv_pipe, send_ret_pipe, recv_cancel, db_send);
    println!("Server started..");
    (send_pipe, recv_ret_pipe, send_cancel)
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Cancel {
    msg: String,
}

#[allow(dead_code)]
fn handle_get(
    msg: SafeArcMsg,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<SafeArcMsg>,
    db: &PgConnection,
) {
    
    let mut wrap = Wrapper::new()
                        .set_model(ModelType::Post)
                        .set_msg_type(MessageType::Get)
                        .build();

    for m in msg.items() {
        let mut dne_flag = false;
        {
            let mut borrowed_val = cash.borrow();
            
            match borrowed_val.get(&m.get_data().id) {
                Some(val) => {
                    println!("For key: {:?} ----> {:?}", &m.get_data().id, val);
                    let resource = Arc::new(val.clone());
                    wrap.items_mut().push(resource);
                },
                None => {
                    println!("Key ({:?}) did not exist.", msg);
                    dne_flag=true;
                },
            }
        }
        if dne_flag {
            // get from database
            // let conn: PgConnection = db::establish_connection();
            let post_result: Result<Vec<Post>, result::Error> = Post::get(m.get_data().id, db);
            if post_result.is_err() {
                println!("[Error] {:?}", post_result.unwrap_err());
            } else {
                let post = post_result.unwrap();
                println!("Post recieved from DB: {:?}", post);

                if post.len() > 1 {
                    println!("Too many posts returned! --> #{} instead of 1.", post.len());
                } else {
                    // save in cache
                    {
                        // cash.try_borrow_mut();
                        let mut mutable_cache = cash.borrow_mut();
                        let post_resource = Resource::new(post[0].clone());
                        let inserted = mutable_cache.insert(post[0].id, post_resource.clone());
                        match inserted {
                            Some(val) => {
                                // 
                                println!("******* Key already existed. Previous --> {:?}", val);
                                
                            },
                            None => {
                                println!("Key did not currently exist.");
                            },
                        }
                        wrap.items_mut().push(Arc::new(post_resource));
                    }
                }
            }
        }

        // // respond to client
        // wrap.errors_mut().push(String::from("The key did not exists"));
        
    }
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("Result: {:?}", val),
        Err(e) => println!("[ERROR] {:?}", e),
    };
}

#[allow(dead_code)]
fn handle_create(
    msg: SafeArcMsg,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<SafeArcMsg>,
    db: &Sender<Post>,
) {
    let mut borrowed_val = cash.borrow_mut();
    let mut wrap = Wrapper::new()
                        .set_model(ModelType::Post)
                        .set_msg_type(MessageType::Create)
                        .build();
    
    for m in msg.items() {
        match borrowed_val.insert(m.get_data().id, Resource::new(m.get_data_clone())) {
            Some(val) => {
                println!("Previous key/value: {:?} ----> {:?}", m.get_data().id, val);
                let resource = Arc::new(val.clone());
                wrap.items_mut().push(resource);
            },
            None => {
                println!("Key did not previously exist: {}", m.get_data().id);
            },
        }
        match db.send_timeout(m.get_data().clone(), MAX_DB_SAVE_TIMEOUT) {
            Ok(val) => {},
            Err(e) => {
                println!("Save to DB timed out with error: {:?}. (Timeout: {:?} ms.)", e, MAX_DB_SAVE_TIMEOUT);
            },
        }
    }
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("Result: {:?}", val),
        Err(e) => println!("[ERROR] {:?}", e),
    };
}

#[allow(dead_code)]
fn handle_watch(
    msg: SafeArcMsg,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<SafeArcMsg>,
) {
    let mut borrowed_val = cash.borrow_mut();
    let mut wrap = Wrapper::new()
                        .set_model(ModelType::Post)
                        .set_msg_type(MessageType::Create)
                        .build();

    for m in msg.items() {           
        let res = borrowed_val.get_mut(&m.get_data().id);
        if res.is_some() {
            let val: &mut Resource<Post> = res.unwrap();
            println!("For key: {:?} ----> {:?}", m.get_data().id, val);
            val.add_watch(msg.get_connection_id());
            let watchers = &mut val.all_watchers();
            println!("Current watchers: {:?}", watchers);
        } else {
            println!("Key ({:?}) did not exist.", m.get_data().id);
            wrap.errors_mut().push(String::from("Key did not exist"));
        }
    }
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("Result: {:?}", val),
        Err(e) => println!("[ERROR] {:?}", e),
    };
}

#[allow(dead_code)]
fn handle_update(
    msg: SafeArcMsg,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<SafeArcMsg>,
) {
    let mut borrowed_val = cash.borrow_mut();
    let mut wrap = Wrapper::new()
                        .set_model(ModelType::Post)
                        .set_msg_type(MessageType::Create)
                        .build();

    for m in msg.items() {
        let res = borrowed_val.insert(m.get_data().id, Resource::new(m.get_data_clone()));
        if res.is_some() {
            let val = res.unwrap();
            println!("For key: {:?} ----> {:?}", m.get_data().id, val);
            
        } else {
            println!("Key ({:?}) did not exist.", m.get_data().id);
            wrap.errors_mut().push(String::from("Key did not exist!"));
        }
    }
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("Result: {:?}", val),
        Err(e) => println!("[ERROR] {:?}", e),
    };
}

#[cfg(test)]
mod tests {
    use cache;
    use cache::*;
    use models;
    use models::*;
    use pool;

    use std::sync::{Arc, RwLock};
    use std::thread;
    use std::time::Duration;

    extern crate crossbeam_channel;
    use crossbeam_channel::{Receiver, Select, Sender};

    #[test]
    fn test_selector_extended_get() {
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up();

        // get
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Get)
            .build();

        wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
        let response = a.send(Arc::new(wrap)).unwrap();
        let resp = b.recv();
    }
    #[test]
    fn test_selector_extended_create() {
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up();

        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Create)
            .build();

        wrap.items_mut().push(Arc::new(Resource::new(Post::new())));         
        let response = a.send(Arc::new(wrap)).unwrap();
        let resp = b.recv();
    }
    // create
    #[test]
    fn test_selector_extended_watch() {
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up();
        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Watch)
            .build();
            
        wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
        let response = a.send(Arc::new(wrap)).unwrap();
        let resp = b.recv();
    }

    #[test]
    fn test_selector_extended_update() {
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up();

        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Update)
            .build();
            
        wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
        let response = a.send(Arc::new(wrap)).unwrap();
        let resp = b.recv();
    }

    #[test]
    fn test_selector_extended_cancel() {
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up();
        let cancel = Cancel {
            msg: String::from("[Cancel reason]"),
        };
        let response = c.send(cancel).unwrap();
        let resp = b.recv();
    }
}
