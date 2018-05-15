extern crate crossbeam_channel;
use crossbeam_channel::{Receiver, Select, Sender, TryRecvError, TrySendError};
use models::*;
use models::PostResource;
use pool;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use std::thread::JoinHandle;
use std::time::Duration;


type SafeArcMsg<'a> = Arc<Msg<'a> + Send + Sync>;
// type PostResource = Resource<Post>;


pub fn cache_thread(
    in_pipe: Receiver<SafeArcMsg>,
    ret_pipe: Sender<SafeArcMsg>,
    cancel: Receiver<Cancel>,
) {
    thread::spawn( move || {
        let mut cache = Rc::new(RefCell::new(HashMap::<i32, Resource<Post>>::new())); // Rc::new(Cache::new());
        loop {
            // println!("Strong count: {}.", Rc::strong_count(&cache));
            select_loop! {
                recv(in_pipe, msg) => {
                    let m = msg.clone();
                    let response = match msg.msg_type() {
                        MessageType::Get => {
                            println!("Msg: {:?}", msg.msg_type());
                            let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                            let res = handle_get(msg, c, &ret_pipe);

                        },
                        MessageType::Create => {
                            println!("Msg: {:?}", msg.msg_type());
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_create(msg, c, &ret_pipe);
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
fn wire_up() -> (Sender<Arc<Msg<'static>>>, Receiver<Arc<Msg<'static>>>, Sender<Cancel>) {
    let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<Arc<Msg>>();
    let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<Arc<Msg>>();
    let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<Cancel>();
    let _sel = cache_thread(recv_pipe, send_ret_pipe, recv_cancel);
    println!("Selector closure finished...");
    (send_pipe, recv_ret_pipe, send_cancel)
}

// get, update, subscribe
pub trait MessageSender<T> {
    fn send(&self, msg: T) -> Result<(), TrySendError<T>>;
}

pub trait MessageReciever<V> {
    fn recv(&self, sender: Receiver<V>, block: bool) -> Result<V, &'static str>;
}

pub trait Cancellable<V> {
    fn cancel(&self, msg: String) -> Result<(), crossbeam_channel::SendError<V>>;
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
) {
    println!("{:?}", msg);
    println!("[GET] ------------------------------------------------->");
    let borrowed_val = cash.borrow_mut();
    for m in msg.items() {
        let res = borrowed_val.get(&m.get_data().id);
        if res.is_some() {
            let val = res.unwrap();
            println!("For key: {:?} ----> {:?}", &m.get_data().id, val);
            let resource = Arc::new(val.clone() as PostResource);
            let wrap = Wrapper {
                model_type: ModelType::Post,
                msg_type: MessageType::Get,
                timestamp: 0,
                items: vec![],
            };
            wrap.items.push(resource);
            // let returned_arc = Arc::new(resource) as SafeArcMsg;
            let ret_result = ret_pipe.send(Arc::new(wrap));
        } else {
            println!("Key ({:?}) did not exist.", msg);

            // @TODO: send error back
            // let ret_result = ret_pipe.send(Resource::new(msg.data));
        }
    }
}

#[allow(dead_code)]
fn handle_create(
    msg: Arc<Msg>,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<Arc<Msg>>,
) {
    println!("{:?}", msg);
    println!("[CREATE] ------------------------------------------------->");
    let mut borrowed_val = cash.borrow_mut();
    let res = borrowed_val.insert(msg.data.id(), Resource::new(msg.data.clone()));
    if res.is_some() {
        let val = res.unwrap();
        println!("For key: {:?} ----> {:?}", msg.data.id(), val);
        let ret_result = ret_pipe.send(val.clone());
    } else {
        println!("Key ({:?}) did not exist.", msg.data.id());
        let ret_result = ret_pipe.send(Resource::new(msg.data));
    }
}

#[allow(dead_code)]
fn handle_watch(
    msg: Arc<Msg>,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<Arc<Msg>>,
) {
    println!("Msg: {:?}", msg);
    println!("[WATCH] ------------------------------------------------->");
    let mut borrowed_val = cash.borrow_mut();
    let res = borrowed_val.get_mut(&msg.data.id());
    if res.is_some() {
        let val: &mut Resource<Post> = res.unwrap();
        println!("For key: {:?} ----> {:?}", msg.data.id(), val);
        val.add_watch(User::new());
        let watchers = &mut val.all_watchers();
        println!("Watchers: {:?}", watchers);
        let by_ids: Vec<i32> = watchers.iter_mut().map(|x| x.id).collect();
        println!("Watcher id's ==> {:?}", by_ids);
        let ret_result = ret_pipe.send(val.clone());
    } else {
        println!("Key ({:?}) did not exist.", msg.data.id());
        let ret_result = ret_pipe.send(Resource::new(msg.data));
    }
}

#[allow(dead_code)]
fn handle_update(
    msg: Arc<Msg>,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<Arc<Msg>>,
) {
    println!("{:?}", msg);
    println!("[UPDATE] ------------------------------------------------->");
    let mut borrowed_val = cash.borrow_mut();
    let res = borrowed_val.insert(msg.data.id(), Resource::new(msg.data.clone()));
    if res.is_some() {
        let val = res.unwrap();
        println!("For key: {:?} ----> {:?}", msg.data.id(), val);
        let ret_result = ret_pipe.send(val.clone());
    } else {
        println!("Key ({:?}) did not exist.", msg.data.id());
        let ret_result = ret_pipe.send(Resource::new(msg.data));
    }
}

fn test_selector_extended<'a>() {
    let (a, b, c): (
        crossbeam_channel::Sender<Arc<Msg>>,
        crossbeam_channel::Receiver<Arc<Msg>>,
        crossbeam_channel::Sender<Cancel>,
    ) = wire_up();
    println!("A: {}", a.len());
    println!("B: {}", b.len());
    println!("C: {}", c.len());

    // get
    let response = a.send(Message::<Post>::new())
        .expect("There was a terrible error sending it!");
    println!("response: {:?}", response);
    let resp = b.recv();
    println!("resp: {:?}", resp);

    // create
    let mut create = Message::<Post>::new();
    create.msg_type = MessageType::Create;
    let response = a.send(create)
        .expect("There was a terrible error sending it!");

    println!("response: {:?}", response);
    let resp = b.recv();
    println!("resp: {:?}", resp);

    // watch
    let mut create = Message::<Post>::new();
    create.msg_type = MessageType::Watch;
    let response = a.send(create)
        .expect("There was a terrible error sending it!");

    println!("response: {:?}", response);
    let resp = b.recv();
    println!("resp: {:?}", resp);

    // thread::sleep(Duration::from_secs(2));

    // update
    let mut create = Message::<Post>::new();
    create.msg_type = MessageType::Update;
    let response = a.send(create)
        .expect("There was a terrible error sending it!");

    println!("response: {:?}", response);
    let resp = b.recv();
    println!("resp: {:?}", resp);

    // cancel
    let cancel = Cancel {
        msg: String::from("CANCEL MEOOOW."),
    };
    create.msg_type = MessageType::Watch;
    let response = c.send(cancel)
        .expect("There was a terrible error sending it!");

    println!("response: {:?}", response);
    let resp = b.recv();
    println!("resp: {:?}", resp);
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
    fn test_selector_extended() {
        cache::test_selector_extended();
    }
}
