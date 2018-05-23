extern crate crossbeam_channel;
use crossbeam_channel::{Receiver, Sender};
use db::*;
use diesel::pg::PgConnection;
use diesel::result;
use models::{Item, MessageType, ModelType, Msg, Post, Resource, Wrapper};
use std::cell::{BorrowMutError, RefCell};
use std::collections::HashMap;
use std::hash::Hash;
use std::ops::{Index, IndexMut};
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

const MAX_DB_SAVE_TIMEOUT: Duration = Duration::from_millis(200);

pub type SafeArcMsg = Arc<Msg<'static> + Send + Sync>;
// type PostResource = Resource<Post>;

pub trait Cache {
    type Key;
    type Entry;
    type Err;

    fn get(&self, key: Self::Key) -> Result<&Self::Entry, Self::Err>;
    fn get_mut(&mut self, key: Self::Key) -> Result<&mut Self::Entry, Self::Err>;
    fn put(&mut self, key: Self::Key, value: Self::Entry)
        -> Result<Option<Self::Entry>, Self::Err>;
}

#[derive(Debug)]
pub struct AssociativeVecCache<V> {
    _inner: Vec<V>,
}

#[derive(Debug)]
pub enum CacheError {
    Get(&'static str),
    GetMut(&'static str),
    Put(&'static str),
}

trait IntegerKey {}

impl IntegerKey for u8 {}
impl IntegerKey for u16 {}
impl IntegerKey for u32 {}
impl IntegerKey for u64 {}

impl IntegerKey for i8 {}
impl IntegerKey for i16 {}
impl IntegerKey for i32 {}
impl IntegerKey for i64 {}

impl<V> Index<i32> for AssociativeVecCache<V> {
    type Output = V;
    fn index(&self, index: i32) -> &V {
        &self._inner[index as usize]
    }
}

impl<V> IndexMut<i32> for AssociativeVecCache<V> {
    fn index_mut(&mut self, index: i32) -> &mut V {
        &mut self._inner[index as usize]
    }
}

impl Cache for AssociativeVecCache<Resource<Post>> {
    type Key = i32;
    type Entry = Resource<Post>;
    type Err = CacheError;

    fn get(&self, key: i32) -> Result<&Resource<Post>, CacheError> {
        Ok(&self._inner[key as usize])
    }

    fn get_mut(&mut self, key: i32) -> Result<&mut Resource<Post>, CacheError> {
        Ok(&mut self._inner[key as usize])
    }

    fn put(
        &mut self,
        key: i32,
        value: Resource<Post>,
    ) -> Result<Option<Resource<Post>>, CacheError> {
        if key as usize > self._inner.len() {
            self._inner
                .resize(2 * key as usize, Resource::new(Post::new()));
        }
        self._inner[key as usize] = value;
        Ok(None)
    }
}

impl<V> AssociativeVecCache<V> {
    pub fn new() -> AssociativeVecCache<V> {
        AssociativeVecCache::<V> { _inner: vec![] }
    }
}

#[derive(Debug)]
pub struct HashMapCache<K: Eq + Hash, V> {
    _inner: HashMap<K, V>,
}

impl<K, V> HashMapCache<K, V>
where
    K: Eq + Hash,
{
    pub fn new() -> HashMapCache<K, V> {
        HashMapCache {
            _inner: HashMap::new(),
        }
    }
}

impl Cache for HashMapCache<i32, Resource<Post>> {
    type Key = i32;
    type Entry = Resource<Post>;
    type Err = CacheError;

    fn get(&self, key: i32) -> Result<&Resource<Post>, CacheError> {
        match self._inner.get(&key) {
            Some(val) => Ok(val),
            None => Err(CacheError::Get("Does not exist")),
        }
    }

    fn get_mut(&mut self, key: i32) -> Result<&mut Resource<Post>, CacheError> {
        match self._inner.get_mut(&key) {
            Some(val) => Ok(val),
            None => Err(CacheError::GetMut(
                "Does not exist... or can't be gotten as mutable?",
            )),
        }
    }

    fn put(
        &mut self,
        key: i32,
        value: Resource<Post>,
    ) -> Result<Option<Resource<Post>>, CacheError> {
        match self._inner.insert(key, value) {
            Some(val) => Ok(Some(val)),
            None => Err(CacheError::Put(
                "Not an error, just did not previously exist.",
            )),
        }
    }
}


#[allow(dead_code)]
pub type SmartCache = RefCell<HashMap<i32, Resource<Post>>>;

#[allow(dead_code)]
pub fn cache_thread(
    in_pipe: Receiver<SafeArcMsg>,
    ret_pipe: Sender<SafeArcMsg>,
    cancel: Receiver<Cancel>,
    db_send: Sender<Post>,
) {
    thread::spawn(move || {
        let db = DB::new();

        let mut cache = Rc::new(RefCell::new(HashMap::<i32, Resource<Post>>::new()));
        loop {
            let conn = db.get();
            select_loop! {
                recv(in_pipe, msg) => {
                    let m = msg.clone();
                    match msg.msg_type() {
                        MessageType::Get => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Get);
                            let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                            handle_get(&msg, c, &ret_pipe, &conn);

                        },
                        MessageType::Create => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Create);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                handle_create(msg, c, &ret_pipe, &db_send);
                            }
                        },
                        MessageType::Watch => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Watch);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                handle_watch(&msg, c, &ret_pipe, &conn, &db_send);
                            }
                        },
                        MessageType::Update => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Update);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                handle_update(&msg, c, &ret_pipe, &db_send);
                            }

                        },
                        MessageType::Manifest => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type());
                            assert_eq!(msg.msg_type(), MessageType::Manifest);
                            {
                                let c: &mut RefCell<HashMap<i32, Resource<Post>>> = Rc::get_mut(&mut cache).unwrap();
                                let res = handle_manifest(msg, c, &ret_pipe, &conn);
                            }
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

#[allow(dead_code)]
type RcCellHash<T> = Rc<RefCell<HashMap<i32, Resource<T>>>>;

#[allow(dead_code)]
/// wire_up uses the types to setup crossbeam channels and returns the relevant information
pub fn wire_up<'a>(
    db_send: Sender<Post>,
) -> (Sender<SafeArcMsg>, Receiver<SafeArcMsg>, Sender<Cancel>) {
    let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<SafeArcMsg>();
    let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<SafeArcMsg>();
    let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<Cancel>();

    cache_thread(recv_pipe, send_ret_pipe, recv_cancel, db_send);

    println!("Server started..");
    (send_pipe, recv_ret_pipe, send_cancel)
}

type RefCache<'a> = &'a mut RefCell<HashMap<i32, Resource<Post>>>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Cancel {
    msg: String,
}

fn handle_manifest(
    msg: SafeArcMsg,
    cash: &mut RefCell<HashMap<i32, Resource<Post>>>,
    ret_pipe: &Sender<SafeArcMsg>,
    db: &PgConnection,
) {
    //to be sent back -> will contain post content on any post whose version is out of date
    let mut wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Manifest)
        .build();

    let mut db_posts: Vec<i32> = Vec::new();
    println!("[CACHE] Manifest: begin");

    for m in msg.items() {
        let mut borrowed_val = cash.borrow();
        match borrowed_val.get(&m.get_data().id) {
            //1. if cache has this post id:
            Some(val) => {
                println!(
                    "[CACHE] Manifest: For key: {:?} ----> {:?}",
                    &m.get_data().id,
                    val
                );
                //2. If the version provided does not match the version in the cache
                if val.version != m.get_version() {
                    //3. Add the entire post's content to the return wrapper's items
                    println!(
                        "[CACHE] manifest: adding post {} to return list",
                        val.get_data().id
                    );
                    let resource = Arc::new(val.clone());
                    wrap.items_mut().push(resource);
                }
                //otherwise, the sender has the correct post and doesn't need it updated
            }
            //4. If cache does not have this post id:
            None => {
                println!("[CACHE] Manifest Key ({:?}) did not exist.", msg);
                //5. Add it to the list of the db post gets we'll need to make
                db_posts.push(m.get_data().id.clone());
            }
        }
    }
    println!("[CACHE] Manifest: making db hits for posts {:?}", db_posts);
    //6. Get all the posts in the manifest list that weren't in the cache

    let mut posts: Vec<Post> = Post::get_all(db_posts, db).expect("Getting from database failed");

    println!("[CACHE] Manifest: got posts from db: {:?}", posts);

    let mut mutable_cache = cash.borrow_mut();
    // For each post returned by db
    while !posts.is_empty() {
        //pop() is only none when posts is empty; never because of loop condition
        let post: Post = posts.pop().unwrap();

        //7. add those posts to the cache with version 0
        let mut resource = Resource::new(post);
        resource.version = 0;
        mutable_cache.insert(resource.get_data().id.clone(), resource.clone());

        //8. Add them all to the return list.
        println!(
            "[CACHE] manifest: adding post {} to return list",
            resource.get_data().id
        );
        wrap.items_mut().push(Arc::new(resource));
    }
    //9. Send back the return list.
    ret_pipe.send(Arc::new(wrap));
    println!("[CACHE] Manifest: end");
}

#[allow(dead_code)]
fn handle_get(msg: &SafeArcMsg, cash: RefCache, ret_pipe: &Sender<SafeArcMsg>, db: &PgConnection) {
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
                        let mut mutable_cache = cash.borrow_mut();
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
    msg: &SafeArcMsg,
    cash: RefCache,
    ret_pipe: &Sender<SafeArcMsg>,
    db_read: &PgConnection,
    db_write: &Sender<Post>,
) {
    // create a wrapper for the response
    let wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Create)
        .build();

    for m in msg.items() {
        let mut exists_cache = Option::default();
        let mut exists = false;

        // Check cache if it already exists
        {
            let c = cash.borrow();
            if let Some(val) = c.get(&m.get_data().id) {
                exists_cache = Some(val.clone());
            };
        }

        // This next section does a few things:
        // [1] Check if there's a value already in the cache.
        // [2] Already in the cache
        //     [a] check if it's already in the watch list
        // [3] Not already in cache
        //     [a] get the posts from the db
        //     [b] put them in the cache
        //     [c] add to watch list
        //
        match exists_cache {
            Some(val) => {
                exists = val.all_watchers()
                    .iter()
                    .any(|&x| x == msg.get_connection_id());
            }
            None => {
                // no value to watch, grab from DB?
                let posts: Option<Vec<Post>> = match Post::get(m.get_data().id, db_read) {
                    Ok(val) => Some(val),
                    Err(e) => None,
                };
                if posts.is_some() {
                    let cleaned_posts_response: Vec<Resource<Post>> = posts
                        .unwrap()
                        .into_iter()
                        .map(|post| create_post_cache(&post, cash))
                        .filter(|(resource, need_db)| *need_db && resource.is_ok())
                        .map(|(resource, _)| resource.unwrap())
                        .filter(|resource| resource.is_some())
                        .map(|resource| resource.unwrap())
                        .collect();
                    println!("cleaned_posts_response: {:?}", cleaned_posts_response);
                }
            }
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
                    ret.unwrap()
                } else {
                    errors.push(ret.map_err(|e| format!("{:?}", e)).unwrap_err());
                    return vec![]; // empty
                }
                // ret
            })
            .collect();
        println!("RESULT SET: {:?}", rs);
        let errors_inner: Vec<String> = create_posts_db(rs.as_slice(), db_write, true)
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
    posts: &[Post],
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
    match mut_cache {
        Ok(ref mut val) => {
            match val.insert(post.id, Resource::new(post.clone())) {
                Some(result) => {
                    (Ok(Some(result)), false) // key existed
                }
                None => {
                    (Ok(None), true) // key did not exist
                }
            }
        }
        Err(e) => {
            println!("There was an error borrowing the cache.");
            (Err(e), true) // @TODO: pull from db just in case?
        }
    }
}

#[allow(dead_code)]
fn handle_update(
    msg: &SafeArcMsg,
    cash: RefCache,
    ret_pipe: &Sender<SafeArcMsg>,
    db_write: &Sender<Post>,
) {
    let mut cache_mut = cash.borrow_mut();
    let all_watchers = &mut vec![];
    for m in msg.items() {
        {
            let resource = cache_mut.get(&m.get_data().id);
            if resource.is_some() {
                // current watchers from Cache
                let w = resource.unwrap().get_watchers().to_vec();
                println!("Watchers --> {:?}", w);
                all_watchers.push(w);
            }
        }
        // insert updates
        if let Some(entry) = cache_mut.get_mut(&m.get_data().id) {
            let old_watchers = entry.get_watchers().clone();
            *entry = Resource::new(m.get_data().clone());
            entry.watchers.clear();
            entry.watchers.extend(old_watchers);
            entry.increment();
        }
    }
    // create response with...
    //  [1] updated data
    //  [2] watchers list to send updates to
    let wrap = Wrapper::new()
        .set_model(ModelType::Post)
        .set_msg_type(MessageType::Create)
        .set_items(msg.items(), all_watchers.as_slice())
        .build();

    // return the watchers ID's, on success writeback to DB..?
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => {
            println!("[CACHE] Result: {:?}", val);
            let posts: Vec<Post> = msg.items()
                .iter()
                .map(|arcitem| arcitem.get_data_clone())
                .collect();
            create_posts_db(posts.as_slice(), db_write, true);
        }
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

    #[test]
    fn test_cache_get() {
        let (send_db, recv_db) = crossbeam_channel::unbounded();
        let db_handle = thread::spawn(move || {
            save_posts(recv_db);
        });
        let (a, b, c): (
            crossbeam_channel::Sender<SafeArcMsg>,
            crossbeam_channel::Receiver<SafeArcMsg>,
            crossbeam_channel::Sender<Cancel>,
        ) = wire_up(send_db);

        let mut wrap = Wrapper::new()
            .set_model(ModelType::Post)
            .set_msg_type(MessageType::Get)
            .build();

        let mut p = Post::new();
        p.id = 1;

        wrap.items_mut().push(Arc::new(Resource::new(p)));

        match a.send(Arc::new(wrap)) {
            Ok(val) => {}
            Err(e) => {
                println!("[Error] ---> {:?}", e);
            }
        };

        match b.recv() {
            Ok(val) => println!("{:?}", val.items()),
            Err(e) => {
                println!("[Error] ---> {:?}", e);
                let ret: String = format!("Error receiving from channel (from cache).");
            }
        };
    }
    #[test]
    fn test_vec_cache_get() {
        let mut vc = AssociativeVecCache::<Resource<Post>>::new();
        match vc.put(1, Resource::new(Post::new())) {
            Ok(val) => match val {
                Some(some) => println!("SOME: {:?}", some),
                None => println!("None."),
            },
            Err(e) => {
                println!("There was an error: {:?}", e);
            }
        }
        println!("VC: {:?}", vc);

        let mut p = Post::new();
        p.id = 1000;
        p.likes = 100;
        match vc.put(1000, Resource::new(p)) {
            Ok(val) => match val {
                Some(some) => println!("SOME: {:?}", some),
                None => println!("None."),
            },
            Err(e) => {
                println!("There was an error: {:?}", e);
            }
        }
        // println!("VC: {:?}", vc);
        println!("***********************************");
        println!("GET: {:?}", vc.get(1000));
        println!("GET: {:?}", vc[1000]);

        {
            let mutable_vc_entry = &mut vc[1];
            mutable_vc_entry.get_data_mut().id = 9999;
        }
        println!("Mutable_VC_ENTRY.ID: {:?}", vc[1]);
    }
}
