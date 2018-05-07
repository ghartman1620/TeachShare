// extern crate crossbeam;
/*!

 
*/
use crossbeam_channel::{Receiver, Select, Sender};
use models::*;
use std::thread;
use std::thread::JoinHandle;

// separate function so that if there is necessary logic it'll happen here and not
// in the cache_looper method where it'll be called.
pub fn build_cache() -> Cache {
    let cash = Cache::new();
    cash
}

#[derive(Clone, Debug)]
pub struct ChannelCycle<T, V>
where
    T: Model,
{
    io: ChanTuple<T>,

    // this is the return channel for operations that require a response.
    ret: Sender<V>,
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
#[allow(unused)]
pub fn cash_looper(chans: Vec<ChannelCycle<Post, Resource<Post>>>) -> JoinHandle<()> {
    let mut sel = Select::new();
    let mut cache = build_cache();

    thread::spawn(move || {
        loop {
            let msg = 'select: loop {
                // In each iteration of the selection loop we probe cases in the same order.
                for vals in &chans {
                    let &(_, ref rx) = &vals.io;
                    if let Ok(msg) = sel.recv(rx) {
                        println!("recieved message: {:?}", msg);

                        // explicit scope so that it can re-mutably borrow on next iteration.
                        {
                            let result = handle_post_msg(&msg, &mut cache);
                            // handle the result, send responses...
                            // if (...) { vals.ret.send(... Respose...); }
                            // println!("RESULT {:?}", result.unwrap());
                            let send_ret = vals.ret.send(result.unwrap());
                            println!("SEND_RESULT: {:?}", send_ret);
                        }

                        // Break the outer loop with the received message as the result.
                        break 'select msg;
                    }
                }
            };
            // println!("Recieved post message: {:?}", msg);
        }
    })
}

fn handle_post_msg(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
    match msg.msg_type {
        MessageType::Create => handle_create(&msg, cash),
        MessageType::Watch => handle_watch(&msg, cash),
        MessageType::Update => handle_update(&msg, cash),
        MessageType::Delete => handle_delete(&msg, cash),
        MessageType::Get => handle_get(&msg, cash),
    }
}

/// handle_get is used to do an actual CREATE of a Post Resource in the Cache.
fn handle_get(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
    println!("[GET] ------------------------------------------------->");
    Option::from(Resource::new(Post::new()))
}

/// handle_delete is used to do an actual CREATE of a Post Resource in the Cache.
fn handle_delete(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
    println!("[DELETE] ------------------------------------------------->");
    Option::from(Resource::new(Post::new()))
}

/// handle_update is used to do an actual CREATE of a Post Resource in the Cache.
fn handle_update(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
    println!("[UPDATE] ------------------------------------------------->");
    let result = cash.update_post(msg.data.id, Resource::new(msg.data.clone()));
    Option::from(Resource::new(Post::new()))
}

/// handle_watch is used to do an actual CREATE of a Post Resource in the Cache.
fn handle_watch(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
    println!("[WATCH] ------------------------------------------------->");
    Option::from(Resource::new(Post::new()))
}

/// handle_create is used to do an actual CREATE of a Post Resource in the Cache.
fn handle_create(msg: &Message<Post>, cash: &mut Cache) -> Option<Resource<Post>> {
    println!("[CREATE] ------------------------------------------------->");
    let result = cash.set_post(msg.data.id, msg.data.clone());
    print!("\n\n");
    for (i, c) in &cash.posts {
        println!("{}.) {:?}", i, c);
    }
    return result;
}

#[cfg(test)]
mod tests {
    use cache;
    use cache::*;
    use models;
    use models::*;

    use std::thread;
    use std::time::Duration;

    extern crate crossbeam_channel;
    use crossbeam_channel::{Receiver, Select, Sender};

    #[test]
    fn test_cash_handler() {
        let mut list: Vec<ChannelCycle<Post, Resource<Post>>> = vec![];
        let (ret, x) = crossbeam_channel::unbounded::<Resource<Post>>();
        thread::spawn(move || {
            loop {
                let res = x.recv();
                println!("X: {:?}", res.unwrap());
            }
        });
        let (send, recv) = crossbeam_channel::unbounded::<Message<Post>>();
        for a in 0..5 {
            let (s, r) = crossbeam_channel::unbounded::<Message<Post>>();
            let val = ChannelCycle{io: (s, r), ret: ret.clone()};
            list.push(val);
        }

        let l2 = list.clone();
        let res = cache::cash_looper(list);

        let second = thread::spawn(move || {
            let mut i = 0;
            for val in &l2 {
                let (s, r) = &val.io;
                // let v = &val.ret;
                let mut p = Post::new();
                p.id = i;
                let m = Message::<Post> {
                    data: p,
                    data_type: ModelType::Post,
                    msg_type: MessageType::Watch,
                    timestamp: 0,
                    version: [0, 0, 0],
                };
                let o = s.try_send(m).unwrap();
                i = i + 1;
                println!("Result: {:?} => {}", o, i);
            }
        });
        second.join();
        res.join().unwrap();
    }

}
