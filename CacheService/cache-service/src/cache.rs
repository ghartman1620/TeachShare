extern crate crossbeam_channel;
use crossbeam_channel::{Receiver, SendTimeoutError, Sender};
use db::*;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result;
// use diesel::
use models::{Item, MessageType, ModelType, Msg, Post, PostResource, Resource, Wrapper};
use pool;
use std::cell::{BorrowMutError, Ref, RefCell};
use std::collections::HashMap;
use std::iter::Map;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use std::thread::JoinHandle;
use std::time::Duration;

const MAX_DB_SAVE_TIMEOUT: Duration = Duration::from_millis(200);

pub type SafeArcMsg = Arc<Msg<'static> + Send + Sync>;
// type PostResource = Resource<Post>;

// pub type Cache = Rc<RefCell<HashMap<i32, Resource<Post>>>>;
#[allow(dead_code)]
pub type SmartCache = Rc<RefCell<HashMap<i32, Resource<Post>>>>;

#[allow(dead_code)]
pub fn cache_thread(
    in_pipe: Receiver<SafeArcMsg>,
    ret_pipe: Sender<SafeArcMsg>,
    cancel: Receiver<Cancel>,
    db_send: Sender<Post>,
) {
    thread::spawn(move || {
        let db = DB::new();

        let mut cache = Rc::new(RefCell::new(HashMap::<i32, Resource<Post>>::new())); // Rc::new(Cache::new());
        loop {
            // println!("Strong count: {}.", Rc::strong_count(&cache));
            let conn = db.get();
            select_loop! {
                recv(in_pipe, msg) => {
                    let m = msg.clone();
                    match msg.msg_type() {
                        MessageType::Get => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Get);
                            // println!("Msg: {:?}", msg.msg_type());
                            let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                            let res = handle_get(msg, c, &ret_pipe, &conn);

                        },
                        MessageType::Create => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Create);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_create(msg, c, &ret_pipe, &db_send);
                            }
                        },
                        MessageType::Watch => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Watch);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_watch(msg, c, &ret_pipe, &conn, &db_send);
                            }
                        },
                        MessageType::Update => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Update);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_update(msg, c, &ret_pipe);
                            }

                        },
                        MessageType::Manifest => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Manifest);
                        },
                    };

                println!("[CACHE] (current) -> {:?}", cache);
                },
                recv(cancel, s) => {
                    println!("[CACHE] Exiting.... Cancel Message: {:?}", s);
                    return;
                }
            }
        }
    });
}

type RcCellHash<T> = Rc<RefCell<HashMap<i32, Resource<T>>>>;

#[allow(dead_code)]
/// wire_up uses the types to setup crossbeam channels and returns the relevant information
pub fn wire_up<'a>(
    db_send: Sender<Post>,
) -> (Sender<SafeArcMsg>, Receiver<SafeArcMsg>, Sender<Cancel>) {
    let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<SafeArcMsg>();
    let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<SafeArcMsg>();
    let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<Cancel>();
    let _sel = cache_thread(recv_pipe, send_ret_pipe, recv_cancel, db_send);
    println!("Server started..");
    (send_pipe, recv_ret_pipe, send_cancel)
}

type RefCache<'a> = &'a mut RefCell<HashMap<i32, Resource<Post>>>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Cancel {
    msg: String,
}

#[allow(dead_code)]
fn handle_get(msg: SafeArcMsg, cash: RefCache, ret_pipe: &Sender<SafeArcMsg>, db: &PgConnection) {
    let mut wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Get)
        .build();

    for m in msg.items() {
        let mut dne_flag = false;
        {
            let mut borrowed_val = cash.borrow();

            // let user_id_val = 1;
            // let result: Vec<&Post> = borrowed_val.iter().filter(|(_, y)| y.data.user_id==user_id_val).map(|(_, y)| &y.data).collect();
            match borrowed_val.get(&m.get_data().id) {
                Some(val) => {
                    println!("[CACHE] For key: {:?} ----> {:?}", &m.get_data().id, val);
                    let resource = Arc::new(val.clone());
                    wrap.items_mut().push(resource);
                }
                None => {
                    println!("[CACHE] Key ({:?}) did not exist.", msg);
                    dne_flag = true;
                }
            }
        }
        if dne_flag {
            // get from database
            // let conn: PgConnection = db::establish_connection();
            let post_result: Result<Vec<Post>, result::Error> = Post::get(m.get_data().id, db);
            if post_result.is_err() {
                println!("[CACHE] Error: {:?}", post_result.unwrap_err());
            } else {
                let mut post = post_result.unwrap();
                println!("[CACHE] Post recieved from DB: {:?}", post);

                if post.len() > 1 {
                    println!(
                        "[CACHE] Too many posts returned! --> #{} instead of 1.",
                        post.len()
                    );
                } else if post.len() == 1 {
                    // save in cache
                    {
                        // cash.try_borrow_mut();
                        let mut mutable_cache = cash.borrow_mut();
                        // {
                        //     let slice: &mut [Post] = post.as_mut_slice();
                        //     for a in slice {
                        //         println!("A: {:?}", a);
                        //     }
                        // }
                        let post_resource = Resource::new(post[0].clone());
                        let inserted = mutable_cache.insert(post[0].id, post_resource.clone());
                        match inserted {
                            Some(val) => {
                                //
                                println!(
                                    "[CACHE] ******* Key already existed. Previous --> {:?}",
                                    val
                                );
                            }
                            None => {
                                println!("[CACHE] Key did not currently exist.");
                            }
                        }
                        wrap.items_mut().push(Arc::new(post_resource));
                    }
                } else {
                    // throw an error
                }
            }
        }

        // // respond to client
        // wrap.errors_mut().push(String::from("The key did not exists"));
    }
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("[CACHE] Successfully sent return value: {:?}", val),
        Err(e) => println!("[CACHE] Error: {:?}", e),
    };
}

#[allow(dead_code)]
fn handle_create(
    msg: SafeArcMsg,
    cash: RefCache,
    ret_pipe: &Sender<SafeArcMsg>,
    db: &Sender<Post>,
) {
    let wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Create)
        .build();

    for m in msg.items() {
        let (resource, need_db) = create_post_cache(m.get_data(), cash);
        println!("[CREATE] Resource: {:?}", resource);
        match resource {
            Ok(val) => match val {
                Some(old) => println!("Replaced value {:?}", old),
                None => println!("Did not previously exist."),
            },
            // This would be a huge problem, and a systemic failure
            Err(e) => println!("There was an error borrowing the cache. {:?}", e),
        }
        if need_db {
            let errors = create_post_db(m.get_data(), db, true);
            println!("[CREATE] <Errors> --> {:?}", errors);
        }
    }
    send_back(ret_pipe, wrap);
}

#[allow(dead_code)]
fn send_back(return_pipe: &Sender<SafeArcMsg>, wrap: Wrapper) {
    match return_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("[CACHE] Successfully sent return value: {:?}", val),
        Err(e) => println!("[CACHE] Error sending on return pipe: {:?}", e),
    };
}

#[allow(dead_code)]
fn handle_watch(
    msg: SafeArcMsg,
    cash: RefCache,
    ret_pipe: &Sender<SafeArcMsg>,
    db_read: &PgConnection,
    db_write: &Sender<Post>,
) {
    // let mut borrowed_val = cash.borrow_mut();
    let wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Create)
        .build();

    let output: &mut Vec<Post> = &mut vec![];
    for m in msg.items() {
        println!("************************ {:?}", m);
        let mut exists_cache = Option::default();
        let mut exists = false;
        let mut need_create = false;
        
        // @TODO: Fix this function first!!!
        {
            let c = cash.borrow();
            exists_cache = c.get(&m.get_data().id).clone();
        }
        // let mut borrowed_cash = cash.borrow();
        // let res = borrowed_cash.get(&m.get_data().id);
        match exists_cache {
            Some(val) => {
                println!("Some(val) ---> {:?}", val);
                exists = val.all_watchers()
                    .iter()
                    .any(|&x| x == msg.get_connection_id());
            }
            None => {
                println!("None ---> ");
                // no value to watch, grab from DB?
                let posts: Option<Vec<Post>> = match Post::get(m.get_data().id, db_read) {
                    Ok(val) => Some(val),
                    Err(e) => None,
                };
                if posts.is_some() {
                    let t = posts.filter(|x| x.len() == 1);
                    if t.is_some() {
                        let mut resulting_value = t.unwrap();
                        {
                            create_posts_cache(&mut resulting_value, cash);
                        }
                    }
                    // insert into cache, add watch
                    {
                        posts.map( |x| {
                            let a = x.into_iter().map(|y| create_post_cache(&y, cash));
                            println!("x: {:?}", x);
                        });
                    }
                    // create_post_cache(&post.unwrap(), cash);
                }
            }
        }
        
        if need_create {
            let errors = create_posts(output, cash, db_read, db_write);
        }

        if !exists {
            let mut cache = cash.borrow_mut();
            let response = cache.get_mut(&m.get_data().id);
            match response {
                Some(val) => {
                    val.add_watch(msg.get_connection_id());
                    println!("[CACHE] Current watchers: {:?}", val.watchers);
                }
                None => {
                    println!("ERROR: There was no valid entry for that Post ID.");
                }
            }
        }
    }
    send_back(ret_pipe, wrap);
}

#[allow(dead_code)]
fn create_posts(
    output: &mut Vec<Post>,
    cache: RefCache,
    db_read: &PgConnection,
    db_write: &Sender<Post>,
) -> Vec<String> {
    let need_db = create_posts_cache(output, cache);
    let mut errors = vec![];
    if need_db.is_some() {
        // actually create them
        let ids = need_db.unwrap();
        let rs: Vec<Post> = ids.into_iter()
            .flat_map(|x| {
                let ret = Post::get(x, db_read);

                // @FIX: This throws away legitimate errors potentially
                // also will treat duplicate PK values as legitimate by
                // flattening the results. This could cause undefined behavior.
                if ret.is_ok() {
                    return ret.unwrap();
                } else {
                    errors.push(ret.map_err(|e| format!("{:?}", e)).unwrap_err());
                    return vec![]; // empty
                }
                // ret
            })
            .collect();
        println!("RESULT SET: {:?}", rs);
        let errors_inner: Vec<String> = create_posts_db(rs, db_write, true)
            .into_iter()
            .map(|val| val.unwrap_err())
            .collect();
        println!("ERRORS_INNER: {:?}", errors_inner);
        errors.extend(errors_inner);
    }
    println!("ALL_ERRORS: {:?}", errors);
    errors
}

#[allow(dead_code)]
fn create_posts_db(
    posts: Vec<Post>,
    db_write: &Sender<Post>,
    async: bool,
) -> Vec<Result<(), String>> {
    // @TODO: Consider fire+forget on saves for performance. This is a good way
    // during development, though.
    posts
        .into_iter()
        .map(|post| create_post_db(&post, db_write, async))
        .collect()
}

#[allow(dead_code)]
fn create_post_db(post: &Post, db_write: &Sender<Post>, async: bool) -> Result<(), String> {
    println!("[CACHE] Sending Post ID# {} to be written to DB.", post.id);

    if !async {
        db_write
            .send_timeout(post.clone(), MAX_DB_SAVE_TIMEOUT)
            .map_err(|err| format!("[CACHE] Save to DB took too long!! Error: {:?}", err))
    } else {
        db_write
            .try_send(post.clone())
            .map_err(|err| format!("[CACHE] Async save to DB failed!! Error: {:?}", err))
    }
}

#[allow(dead_code)]
fn create_posts_cache(output: &mut Vec<Post>, cache: RefCache) -> Option<Vec<i32>> {
    // let need_fetch = &mut vec![];
    let mapped: Vec<i32> = output
        .into_iter()
        .map(|x| {
            let (last, get) = create_post_cache(&x, cache);
            last.expect("There was an error Borrowing the cache!");
            return (x.id, get);
        })
        .filter(|(_, fetch)| *fetch)
        .map(|(a, _)| a)
        .collect();

    println!("{:?}", mapped);
    return Some(mapped);
}

fn create_post_cache(
    post: &Post,
    cache: RefCache,
) -> (Result<Option<Resource<Post>>, BorrowMutError>, bool) {
    let mut mut_cache = cache.try_borrow_mut();
    // mut_cache.or(res).insert(post.id, Resource::new(post))? // .insert(post.id, Resource::new(post));
    match mut_cache {
        Ok(ref mut val) => {
            match val.insert(post.id, Resource::new(post.clone())) {
                Some(result) => {
                    println!("Key existed, old value was: {:?}", result);
                    // key existed
                    // result = old value
                    (Ok(Some(result)), false)
                }
                None => {
                    println!("Key did not exist in pull from DB");
                    // key did not exist
                    (Ok(None), true)
                }
            }
        }
        Err(e) => {
            println!("There was an error borrowing the cache.");
            (Err(e), true) // pull from db just in case?
        }
    }
}

#[allow(dead_code)]
fn handle_update(msg: SafeArcMsg, cash: RefCache, ret_pipe: &Sender<SafeArcMsg>) {
    let wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Create)
        .build();
    let cache_mut = cash.borrow_mut();

    // let mut watchers: Vec<i32> = vec![];
    for m in msg.items() {
        let w = match cache_mut.get(&m.get_data().id) {
            Some(val) => val.get_watchers().to_vec().clone(),
            None => vec![], // return empty vector
        };
        println!("Watchers --> {:?}", w);
        // let data = match cache_mut.get(&m.get_data().id) {
        //     Some(val) => val.clone(),
        //     None => Resource::new(Post::new()),
        // };
        // let value = &mut vec![Arc::new(data),];
        // let mut i = wrap.items_mut()[0].get_watchers_mut();
        // *i = w;
        // let res = borrowed_val.insert(m.get_data().id, Resource::new(m.get_data_clone()));
        // if res.is_some() {
        //     let val = res.unwrap();
        // } else {
        //     println!("[CACHE] Key ({:?}) did not exist.", m.get_data().id);
        //     wrap.errors_mut().push(String::from("[CACHE] Key did not exist!"));
        // }
    }

    // return the watchers ID's
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("[CACHE] Result: {:?}", val),
        Err(e) => println!("[CACHE] Error: {:?}", e),
    };
}

#[cfg(test)]
mod tests {
    use cache;
    use cache::*;
    use db::*;
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
        // start db (SAVE only) thread
        let (send_db, recv_db) = crossbeam_channel::unbounded();
        let db_handle = thread::spawn(move || {
            save_posts(recv_db);
        });

        // start cache + return necessary comm. channels
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(send_db);

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
        // start db (SAVE only) thread
        let (send_db, recv_db) = crossbeam_channel::unbounded();
        let db_handle = thread::spawn(move || {
            save_posts(recv_db);
        });

        // start cache + return necessary comm. channels
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(send_db);

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
        // start db (SAVE only) thread
        let (send_db, recv_db) = crossbeam_channel::unbounded();
        let db_handle = thread::spawn(move || {
            save_posts(recv_db);
        });

        // start cache + return necessary comm. channels
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(send_db);

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
        // start db (SAVE only) thread
        let (send_db, recv_db) = crossbeam_channel::unbounded();
        let db_handle = thread::spawn(move || {
            save_posts(recv_db);
        });

        // start cache + return necessary comm. channels
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(send_db);

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
        // start db (SAVE only) thread
        let (send_db, recv_db) = crossbeam_channel::unbounded();
        let db_handle = thread::spawn(move || {
            save_posts(recv_db);
        });

        // start cache + return necessary comm. channels
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(send_db);
        let cancel = Cancel {
            msg: String::from("[Cancel reason]"),
        };
        let response = c.send(cancel).unwrap();
        let resp = b.recv();
    }
}
