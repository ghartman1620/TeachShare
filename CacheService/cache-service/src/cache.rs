extern crate crossbeam_channel;
use crossbeam_channel::{Receiver, Select, Sender, TryRecvError, TrySendError};
use models::*;
use pool;
use std::fmt::Debug;
use std::ops::Fn;
use std::thread;
use std::sync::Arc;
use std::thread::JoinHandle;

// separate function so that if there is necessary logic it'll happen here and not
// in the cache_looper method where it'll be called.
// pub fn build_cache() -> Cache {
//     let cash = Cache::new();
//     cash
// }

#[derive(Clone, Debug)]
pub struct ChannelCycle<T, V, U>
where
    T: Model,
{
    io: ChanTuple<T>,

    // this is the return channel for operations that require a response.
    ret: Sender<V>,
    cancel: Receiver<U>,
}

pub type SendMsg<T> = Sender<Message<T>>;
pub type RecvMsg<T> = Receiver<Message<T>>;

/// `ChanTuple<T>` is a type alias for `(SendMsg<T>, RecvMsg<T>)`, the tuple
/// where `SendMsg<T>` is `Sender<Message<T>>` and RecvMsg is `Reciever<Message<T>>`.
pub type ChanTuple<T> = (SendMsg<T>, RecvMsg<T>);

/// Select-loop for cache
///
/// # Examples
///
/// ```rust
/// use models::*;
///
/// let mut list: Vec<ChanTuple<Post>> = vec![];
///
/// let (send, recv) = crossbeam_channel::unbounded::<Message<Post>>();
/// for a in 0..5 {
///     let (s, r) = crossbeam_channel::unbounded::<Message<Post>>();
///     list.push((s, r));
/// }
///
/// let res = cache::cash_looper(list);
///
/// ```
// #[allow(unused)]
// pub fn cash_looper(chans: Vec<ChannelCycle<Post, Resource<Post>, Cancel>>) -> JoinHandle<()> {
//     let mut sel = Select::new();
//     let mut cache = build_cache();

//     thread::spawn(move || {
//         let mut close = false;

//         'outer: while !close {
//             let msg = 'select: loop {
//                 // In each iteration of the selection loop we probe cases in the same order.
//                 for vals in &chans {
//                     let &(_, ref rx) = &vals.io;
//                     if let Ok(msg) = sel.recv(rx) {
//                         println!("recieved message: {:?}", msg);

//                         // explicit scope so that it can re-mutably borrow on next iteration.
//                         {
//                             let result = handle_post_msg(&msg, &mut cache);
//                             // handle the result, send responses...
//                             // if (...) { vals.ret.send(... Respose...); }
//                             // println!("RESULT {:?}", result.unwrap());
//                             let send_ret = vals.ret.send(result.unwrap());
//                             println!("SEND_RESULT: {:?}", send_ret);
//                         }

//                         // Break the outer loop with the received message as the result.
//                         break 'select msg;
//                     }

//                     if let Ok(cancel) = sel.recv(&vals.cancel) {
//                         println!("recieved CANCEL: {:?}", cancel);
//                         // panic!("CLOSE");
//                         // return Message<Post>(Post::new());
//                         close = true;
//                         break 'outer;
//                         // break 'getout;
//                     }
//                 }
//             };
//             // println!("Recieved post message: {:?}", msg);
//         }
//         println!("Thread is closing!!!!");
//     })
// }

/// named affectionately after something from starcraft, the video game.
// #[derive(Debug)]
// pub struct Nexus<T, U, V> {
//     pool: pool::ThreadPool,
//     cache: &Cache,
//     send: Sender<T>,
//     recv: Receiver<U>,
//     cancel_send: Receiver<V>,
//     cancel_recv: Sender<V>,
// }

// impl<T, U, V, a> Nexus<T, U, V>
// where
//     T: Debug + Send + MessageSender + 'static,
//     U: Debug + Send + Sync + 'static,
//     V: Debug + Send + Sync + Cancellable + 'static,
// {
//     pub fn new() -> &Nexus<T, U, V> {
//         let p: pool::ThreadPool = pool::ThreadPool::new(1).unwrap();
//         let (snd, _) = crossbeam_channel::unbounded::<T>();
//         let (_, rec) = crossbeam_channel::unbounded::<U>();
//         let rec2 = rec.clone();
//         let (cancel_send, cancel_recv) = crossbeam_channel::unbounded::<V>();
//         let cancel_closure = cancel_recv.clone();
//         let mut c = &mut Cache::new();
//         p.execute(move || {
//             loop {
//                 select_loop! {
//                     recv(rec, r) => {
//                         println!("Recieved: {:?}", r);
//                         handle_post_msg(&r, c);
//                     },
//                     recv(cancel_closure, s) => {
//                         println!("Send: {:?}", s);
//                     }
//                 }
//             }
//         });
//         &Nexus {
//             pool: pool::ThreadPool::new(1).unwrap(),
//             send: snd,
//             recv: rec2,
//             cache: &c,
//             cancel_send: cancel_recv,
//             cancel_recv: cancel_send
//         }
//     }
// }

pub fn selector<'a, S, T, U, V, F>(
    in_pipe: Receiver<T>,
    ret_pipe: Sender<U>,
    cancel: Receiver<V>,
    closure: F,
) where 
    T: Debug,
    U: Debug,
    V: Debug,
    
    F: Fn(T, Arc<Cache<S>>) -> U, //This is crucial need to be able to go from Message<T> -> Message<U>
{
    let cache = Arc::new(Cache::<S>::new());
    loop {
        select_loop! {
            recv(in_pipe, msg) => {
                let cpy = cache.clone();
                let response = closure(msg, cpy);
                ret_pipe.send(response);
            },
            recv(cancel, s) => {
                println!("Cancel Message: {:?}", s);
                return;
            }
        }
    }
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

// impl MessageSender<Message<Post>> for Nexus<Message<Post>, Message<Post>, Cancel> {
//     fn send(&self, msg: Message<Post>) -> Result<(), TrySendError<Message<Post>>> {
//         let (sender, _) = crossbeam_channel::unbounded::<Message<Post>>();
//         sender.try_send(msg)
//     }
// }

// impl MessageReciever<Message<Post>> for Nexus<Message<Post>, Receiver<Message<Post>>, Cancel> {
//     fn recv(
//         &self,
//         reciever: Receiver<Message<Post>>,
//         block: bool,
//     ) -> Result<Message<Post>, &'static str> {
//         if !reciever.is_disconnected() && !block {
//             let res = reciever.try_recv();
//             match res {
//                 Ok(val) => Ok(val),
//                 Err(_) => Err("Could not receive"),
//             }
//         } else {
//             let res = reciever.recv();
//             match res {
//                 Ok(val) => Ok(val),
//                 Err(_) => Err("Could not receive"),
//             }
//         }
//     }
// }

// impl Cancellable<Cancel> for Nexus<Message<Post>, Message<Post>, Cancel> {
//     fn cancel(&self, msg: String) -> Result<(), crossbeam_channel::SendError<Cancel>> {
//         return self.cancel_recv.send(Cancel { msg: msg });
//     }
// }

// fn handle_post_msg<T>(msg: T, cash: &mut Cache<T>) -> Option<Resource<T>> {
//     match msg.msg_type {
//         MessageType::Create => handle_create(&msg, cash),
//         MessageType::Watch => handle_watch(&msg, cash),
//         MessageType::Update => handle_update(&msg, cash),
//         MessageType::Delete => handle_delete(&msg, cash),
//         MessageType::Get => handle_get(&msg, cash),
//     }
// }

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Cancel {
    msg: String,
}

/// handle_get is used to do an actual CREATE of a Post Resource in the Cache.
// fn handle_get(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
//     println!("[GET] ------------------------------------------------->");
//     Option::from(Resource::new(Post::new()))
// }

/// handle_delete is used to do an actual CREATE of a Post Resource in the Cache.
// fn handle_delete(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
//     println!("[DELETE] ------------------------------------------------->");
//     Option::from(Resource::new(Post::new()))
// }

/// handle_update is used to do an actual CREATE of a Post Resource in the Cache.
// fn handle_update(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
//     println!("[UPDATE] ------------------------------------------------->");
//     let result = cash.update_post(msg.data.id, Resource::new(msg.data.clone()));
//     Option::from(Resource::new(Post::new()))
// }

/// handle_watch is used to do an actual CREATE of a Post Resource in the Cache.
// fn handle_watch(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
//     println!("[WATCH] ------------------------------------------------->");
//     Option::from(Resource::new(Post::new()))
// }

// /// handle_create is used to do an actual CREATE of a Post Resource in the Cache.
// fn handle_create<T>(msg: T, cash: &mut Cache<T>) -> Option<Resource<T>> {
//     println!("[CREATE] ------------------------------------------------->");
//     let result = cash.set(msg.data.id, msg.data.clone());
//     print!("\n\n");
//     for (i, c) in &cash._data {
//         println!("{}.) {:?}", i, c);
//     }
//     return result;
// }

/// wire_up<T, U, V> uses the types to setup crossbeam channels and returns the relevant information
fn wire_up<'a, S, T, U, V, F>(closure: F) -> (Sender<T>, Receiver<U>, Sender<V>)
where
    T: Debug + Sized + Send + 'static,
    U: Debug + Sized + Send + 'static,
    V: Debug + Sized + Send + 'static,
    F: Fn(T, Arc<Cache<S>>) -> U + Send + 'static,
{
    let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<T>();
    let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<U>();
    let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<V>();
    // let pool = pool::ThreadPool::new(1).unwrap();
    // pool.execute(|| {
    //     println!("We are inside the pool.executre(||){{...}}");
    //     let sel = selector(recv_pipe, send_ret_pipe, recv_cancel, closure);
    //     println!("Selector finished...");
    // });
    thread::spawn( move || {
        println!("We are inside the pool.executre(||){{...}}");
        let sel = selector(recv_pipe, send_ret_pipe, recv_cancel, closure);
        println!("Selector finished...");
    });
    println!("Selector closure finished...");
    (send_pipe, recv_ret_pipe, send_cancel)
}

fn handle_get<T, U>(msg: T, cash: &Arc<Cache<U>>) -> Option<T> where
    T: Debug,
{
    println!("{:?}", msg);
    println!("[GET] ------------------------------------------------->");
    Option::from(msg)
}

fn handle_create<T, U>(msg: T, cash: &mut Arc<Cache<U>>) -> Option<T> where
    T: Debug,
{
    println!("{:?}", msg);
    println!("[CREATE] ------------------------------------------------->");
    Option::from(msg)
}

fn test() {
    // let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<Message<Post>>();
    // let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<Message<Post>>();
    // let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<Cancel>();

    // let (snd, ret, cancel): (
    //     crossbeam_channel::Sender<Message<Post>>,
    //     crossbeam_channel::Receiver<Message<Post>>,
    //     crossbeam_channel::Sender<Cancel>,
    // ) = wire_up(&mut |msg: Message<Post>, cache: &mut Cache<Post>| msg);
    // println!("A: {}", snd.len());
    // println!("B: {}", ret.len());
    // println!("C: {}", cancel.len());

    // let result = selector(recv_pipe, send_ret_pipe, recv_cancel,  &mut |msg, cache: &mut Cache<Post>| {
    //     println!("Message: {:?}", msg);
    //     msg
    // });
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

    // #[test]
    // /// Tests whether or not the cach_handler works as expected in that it sends a certain
    // /// number of messages and gets back a certain number of messages on a select-loop.
    // fn test_cash_handler() {
    //     let (cancel_send, cancel_recv) = crossbeam_channel::unbounded::<Cancel>();

    //     let mut list: Vec<ChannelCycle<Post, Resource<Post>, Cancel>> = vec![];
    //     let count = Arc::new(RwLock::new(0));

    //     let (ret, x) = crossbeam_channel::unbounded::<Resource<Post>>();
    //     let c2 = count.clone();
    //     let last = count.clone();
    //     let cancel2 = cancel_recv.clone();
    //     let p = pool::ThreadPool::new(4).unwrap();
    //     let receiver = p.execute(move || {
    //         let c3 = &mut c2.clone();
    //         loop {
    //             select_loop! {
    //                 recv(cancel2, result) => {
    //                     println!("Recieved [cancel]: {:?}", result);
    //                     return;
    //                 },
    //                 recv(x, result) => {
    //                     println!("Recieved: {:?}", result);
    //                     {
    //                         let mut n = c3.write().unwrap();
    //                         *n = *n + 1;
    //                         println!("{}", n);
    //                     }
    //                     println!("X: {:?} --> count = {}.", result, c3.read().unwrap());
    //                 }
    //             }
    //         }
    //     });
    //     let (send, recv) = crossbeam_channel::unbounded::<Message<Post>>();
    //     // let (cancel_send, cancel_recv) = crossbeam_channel::unbounded::<Cancel>();
    //     for a in 0..5 {
    //         let (s, r) = crossbeam_channel::unbounded::<Message<Post>>();
    //         let val = ChannelCycle {
    //             io: (s, r),
    //             ret: ret.clone(),
    //             cancel: cancel_recv.clone(),
    //         };
    //         list.push(val);
    //     }

    //     let l2 = list.clone();
    //     let res = cache::cash_looper(list);

    //     let second = p.execute(move || {
    //         let mut i = 0;
    //         for val in &l2 {
    //             let &(ref s, ref r) = &val.io;
    //             // let v = &val.ret;
    //             let mut p = Post::new();
    //             p.id = i;
    //             let m = Message::<Post> {
    //                 data: p,
    //                 data_type: ModelType::Post,
    //                 msg_type: MessageType::Watch,
    //                 timestamp: 0,
    //                 version: [0, 0, 0],
    //             };
    //             let o = s.send(m).unwrap();
    //             i = i + 1;
    //             println!("Result: {:?} => {}", o, i);
    //         }
    //         println!("EXITING SECOND THREAD");
    //     });
    //     thread::sleep(Duration::from_secs(1));
    //     let x = Arc::strong_count(&last);
    //     println!("Strong references: {}", x);

    //     cancel_send.send(Cancel {
    //         msg: String::from("Need to close for the test."),
    //     });
    //     cancel_send.send(Cancel {
    //         msg: String::from("Need to close for the test."),
    //     });
    //     res.join();
    //     let x = Arc::strong_count(&count);
    //     println!("Strong references: {}", x);
    //     drop(last);
    //     let x = Arc::strong_count(&count);
    //     println!("Strong references: {}", x);
    //     let v = Arc::try_unwrap(count);
    //     let y = v.unwrap();
    //     println!("Total count: {:?}", *y.read().unwrap());
    //     assert_eq!(*y.read().unwrap(), 5);
    // }

    /// Tests whether or not the cach_handler works as expected in that it sends a certain
    /// number of messages and gets back a certain number of messages on a select-loop.
    // #[test]
    // fn test_cash_handler_create() {
    //     let c_loop/*: Nexus<Message<Post>, Message<Post>, Cancel>*/ =
    //         Nexus::<Message<Post>, Message<Post>, Cancel>::new();
    // }

    #[test]
    fn test_selector() {
        let (a, b, c): (
            crossbeam_channel::Sender<Message<Post>>,
            crossbeam_channel::Receiver<Message<Post>>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(|msg: Message<Post>, cache: Arc<Cache<Post>>| {
            println!("MESSAGE: {:?}", msg);
            msg
        });
        println!("A: {}", a.len());
        println!("B: {}", b.len());
        println!("C: {}", c.len());
        let response = c.send(Cancel {
            msg: String::from("Cancelled it!"),
        }).expect("There was a terrible error cancelling it!");
        println!("response: {:?}", response);
    }

    #[test]
    fn test_selector_extended() {
        let (a, b, c): (
            crossbeam_channel::Sender<Message<Post>>,
            crossbeam_channel::Receiver<Message<Post>>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(|msg: Message<Post>, cache: Arc<Cache<Post>>| {
            println!("MESSAGE: {:?}", msg);
            let m = msg.clone();
            let mut c = cache.clone();
            match msg.msg_type {
                MessageType::Get => {
                    println!("Msg: {:?}", msg.msg_type);
                    handle_get(&m, &c);
                },
                MessageType::Create => {
                    println!("Msg: {:?}", msg.msg_type);
                    handle_create(&m, &mut c);
                },
                MessageType::Watch => {
                    println!("Msg: {:?}", msg.msg_type);
                },
                MessageType::Update => {
                    println!("Msg: {:?}", msg.msg_type);
                }
            }
            msg
        });
        println!("A: {}", a.len());
        println!("B: {}", b.len());
        println!("C: {}", c.len());

        // get
        let response = a.send(Message::<Post>::new()).expect("There was a terrible error sending it!");
        println!("response: {:?}", response);
        let resp = b.recv();
        println!("resp: {:?}", resp);

        // create
        let mut create = Message::<Post>::new();
        create.msg_type = MessageType::Create;
        let response = a.send(create).expect("There was a terrible error sending it!");
        
        println!("response: {:?}", response);
        let resp = b.recv();
        println!("resp: {:?}", resp);
    }
}
