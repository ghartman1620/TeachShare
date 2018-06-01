extern crate crossbeam_channel;
use crossbeam_channel::{Receiver, Sender};
use db::*;
use diesel::pg::PgConnection;
use models::*;
use std::cell::{BorrowMutError, RefCell};
use std::collections::{BTreeMap, HashMap};
use std::hash::Hash;
use std::ops::{Index, IndexMut};
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use users::{User};

const MAX_DB_SAVE_TIMEOUT: Duration = Duration::from_millis(200);

pub trait Cache {
    type Key;
    type Entry;
    type Err;

    fn get(&self, key: Self::Key) -> Option<&Self::Entry>;
    fn get_mut(&mut self, key: Self::Key) -> Option<&mut Self::Entry>;
    fn put(&mut self, key: Self::Key, value: Self::Entry) -> Option<Self::Entry>;
}

/// Unused (substantially) currently but may soon
#[derive(Debug)]
pub enum CacheError {
    Get(&'static str),
    GetMut(&'static str),
    Put(&'static str),
}

#[derive(Debug)]
pub struct HashMapCache<K: Eq + Hash, V> {
    _inner: HashMap<K, V>,
    _permissions: BTreeMap<i32, UserObjectPermission>,
}

impl<K, V> HashMapCache<K, V>
where
    K: Eq + Hash,
{
    pub fn new(db: &DB) -> HashMapCache<K, V> {
        let mut permissions: BTreeMap<i32, UserObjectPermission> = BTreeMap::new();
        let db_perm = UserObjectPermission::get_all(db).unwrap();
        for perm in &db_perm {
            debug!("Adding permission: {:?} to cache.", perm);
            permissions.insert(perm.id, perm.clone());
        }

        HashMapCache {
            _inner: HashMap::new(),
            _permissions: permissions,
        }
    }
}

impl Cache for HashMapCache<ID, Resource> {
    type Key = ID;
    type Entry = Resource;

    /// Currently unused.
    type Err = CacheError;

    /// Thin wrapper around a simple get immutable borrow from the
    /// underlying hashmap
    fn get(&self, key: ID) -> Option<&Resource> {
        self._inner.get(&key)
    }

    /// Thin wrapper to get a mutable reference to the item stored in the
    /// cache.
    fn get_mut(&mut self, key: ID) -> Option<&mut Resource> {
        self._inner.get_mut(&key)
    }

    /// Very thin wrapper around insert in a hashmap
    fn put(&mut self, key: ID, value: Resource) -> Option<Resource> {
        self._inner.insert(key, value)
    }
}



// not really recommended..
impl Index<ID> for HashMapCache<ID, Resource> {
    type Output = Resource;

    fn index(&self, index: ID) -> &Resource {
        self._inner.index(&index)
    }
}

// not really commended either..
impl IndexMut<ID> for HashMapCache<ID, Resource> {
    fn index_mut(&mut self, index: ID) -> &mut Resource {
        if !self._inner.contains_key(&index) {
            // @TODO: spruce this up so that it covers all corner cases..

            match index {
                ID::Post(id) => {
                    self._inner
                        .insert(index.clone(), Resource::new(Model::Post(Post::new())));
                }
                ID::User(id) => {
                    self._inner
                        .insert(index.clone(), Resource::new(Model::User(User::new())));
                }
                ID::Comment(id) => {
                    self._inner
                        .insert(index.clone(), Resource::new(Model::Comment(Comment::new())));
                }
            }
        }
        match self._inner.get_mut(&index) {
            Some(val) => val,
            None => panic!("Index did not exist!!"),
        }
    }
}

type RefCellCache = RefCell<HashMapCache<ID, Resource>>;

#[allow(dead_code)]
pub fn cache_thread(
    in_pipe: Receiver<Arc<Msg>>,
    ret_pipe: Sender<Arc<Msg>>,
    cancel: Receiver<Cancel>,
    db_send: Sender<Post>,
) {
    thread::spawn(move || {
        let db = DB::new();

        let mut cache = Rc::new(RefCell::new(HashMapCache::new(&db))); //Rc::new(RefCell::new(HashMap::<i32, Resource<Post>>::new()));
        println!("[CACHE] {:?}", cache);
        loop {
            let conn = db.get();
            select_loop! {
                recv(in_pipe, msg) => {
                    let m = msg.clone();
                    match msg.msg_type {
                        MessageType::Get => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type);
                            assert_eq!(msg.msg_type, MessageType::Get);
                            {
                                let c: &mut RefCell<HashMapCache<ID, Resource>> = Rc::get_mut(&mut cache).unwrap();
                                handle_get(&msg, c, &ret_pipe, &conn);
                            }
                        },
                        MessageType::Create => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type);
                            assert_eq!(msg.msg_type, MessageType::Create);
                            {
                                let c: &mut RefCell<HashMapCache<ID, Resource>> = Rc::get_mut(&mut cache).unwrap();
                                handle_create(&msg, c, &ret_pipe, &db_send);
                            }
                        },
                        MessageType::Watch => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type);
                            assert_eq!(msg.msg_type, MessageType::Watch);
                            {
                                let c: &mut RefCell<HashMapCache<ID, Resource>> = Rc::get_mut(&mut cache).unwrap();
                                handle_watch(&msg, c, &ret_pipe, &conn, &db_send);
                            }
                        },
                        MessageType::Update => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type);
                            assert_eq!(msg.msg_type, MessageType::Update);
                            {
                                let c: &mut RefCell<HashMapCache<ID, Resource>> = Rc::get_mut(&mut cache).unwrap();
                                handle_update(&msg, c, &ret_pipe, &db_send);
                            }
                        },
                        //  _ => println!("CATCH ALL"),
                        MessageType::Manifest => {
                            println!("[CACHE] RECEIVED => {:?}", msg.msg_type);
                            assert_eq!(msg.msg_type, MessageType::Manifest);
                            {
                                let c: &mut RefCell<HashMapCache<ID, Resource>> = Rc::get_mut(&mut cache).unwrap();
                                handle_manifest(msg, c, &ret_pipe, &conn);
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

// #[allow(dead_code)]
// type RcCellHash<T> = Rc<RefCell<HashMap<i32, Resource>>>;

#[allow(dead_code)]
/// wire_up uses the types to setup crossbeam channels and returns the relevant information
pub fn wire_up(db_send: Sender<Post>) -> (Sender<Arc<Msg>>, Receiver<Arc<Msg>>, Sender<Cancel>) {
    let (send_pipe, recv_pipe) = crossbeam_channel::unbounded::<Arc<Msg>>();
    let (send_ret_pipe, recv_ret_pipe) = crossbeam_channel::unbounded::<Arc<Msg>>();
    let (send_cancel, recv_cancel) = crossbeam_channel::unbounded::<Cancel>();

    cache_thread(recv_pipe, send_ret_pipe, recv_cancel, db_send);

    println!("Server started..");
    (send_pipe, recv_ret_pipe, send_cancel)
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Cancel {
    msg: String,
}

fn handle_manifest(
    msg: Arc<Msg>,
    cash: &mut RefCellCache,
    ret_pipe: &Sender<Arc<Msg>>,
    db: &PgConnection,
) {
    //to be sent back -> will contain post content on any post whose version is out of date
    let mut wrap = Msg::new().set_msg_type(MessageType::Manifest).build();

    let mut db_posts: Vec<i32> = Vec::new();
    println!("[CACHE] Manifest: begin");

    for m in &msg.items {
        let id = match &m.data {
            Model::Post(post) => post.id,
            _ => unimplemented!(),
        };

        let mut borrowed_val = cash.borrow();

        match borrowed_val.get(ID::Post(id)) {
            //1. if cache has this post id:
            Some(val) => {
                println!("[CACHE] Manifest: For key: {:?} ----> {:?}", id, val);
                //2. If the version provided does not match the version in the cache
                if val.version != m.version {
                    //3. Add the entire post's content to the return wrapper's items
                    // println!(
                    //     "[CACHE] manifest: adding post {} to return list",
                    //     val.get_data().id
                    // );
                    let resource = Arc::new(val.clone());
                    wrap.items.push(resource);
                }
                //otherwise, the sender has the correct post and doesn't need it updated
            }
            //4. If cache does not have this post id:
            None => {
                println!("[CACHE] Manifest Key ({:?}) did not exist.", id);
                //5. Add it to the list of the db post gets we'll need to make
                db_posts.push(id);
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
        let id = post.id;
        //7. add those posts to the cache with version 0
        let mut resource = Resource::new(Model::Post(post));
        resource.version = 0;
        mutable_cache.put(ID::Post(id), resource.clone());

        //8. Add them all to the return list.
        println!("[CACHE] manifest: adding post {} to return list", id);
        wrap.items.push(Arc::new(resource));
    }
    //9. Send back the return list.
    ret_pipe.send(Arc::new(wrap));
    println!("[CACHE] Manifest: end");
}

#[allow(dead_code)]
fn handle_get(
    msg: &Arc<Msg>,
    cash: &mut RefCellCache,
    ret_pipe: &Sender<Arc<Msg>>,
    db: &PgConnection,
) -> Result<Resource, CacheError> {
    let mut wrap = Msg::new().set_msg_type(MessageType::Get).build();

    for m in &msg.items {
        let mut dne_flag = false;
        let mut db_posts: Vec<Post> = vec![];
        {
            // immutably borrow cache
            let mut cache = cash.borrow();

            // Get the inner cache data, if exists
            let result_data: Option<&Resource> = match &m.data {
                Model::Post(p) => cache.get(ID::Post(p.id)),
                Model::User(u) => cache.get(ID::User(u.id)),
                Model::Comment(c) => cache.get(ID::Comment(c.id)),
            };

            if result_data.is_none() {
                // 1.) get it from the db...
                // 2.) confirm permissions
                // 3.) populate permissions - chunk get's

                // grab the id from the message
                let id = match &m.data {
                    Model::Post(p) => p.id,
                    _ => unimplemented!(),
                };

                // get post from the database
                let post_result = Post::get(id, db);
                match post_result {
                    Ok(posts) => {
                        dne_flag = true;
                        db_posts.extend(posts);
                        println!("POSTS: {:?}", db_posts);
                    }
                    Err(err) => {
                        println!("[DB]<ERROR> {:?}", err);
                    }
                }
            } else {
                // model_data is the data from the cache
                let model_data = result_data.unwrap();
                wrap.items.push(Arc::new(model_data.clone()));
            }
        }
        if dne_flag {
            let mut cache = cash.borrow_mut();
            if db_posts.len() == 1 {
                let first = &db_posts[0];
                let resource_new = Resource::new(Model::Post(first.clone()));
                let inserted = cache.put(ID::Post(first.id), resource_new.clone());
                match inserted {
                    Some(val) => {
                        println!(
                            "[CACHE] ******* Key already existed. Previous --> {:?}",
                            val
                        );
                    }
                    None => {
                        println!("[CACHE] Key did not currently exist.");
                    }
                }
                wrap.items.push(Arc::new(resource_new));
            }
        }
    }
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => println!("[CACHE] Successfully sent return value: {:?}", val),
        Err(e) => println!("[CACHE] Error: {:?}", e),
    };
    Err(CacheError::Get("meh, something went wrong."))
}

#[allow(dead_code)]
fn handle_create(
    msg: &Arc<Msg>,
    cash: &mut RefCellCache,
    ret_pipe: &Sender<Arc<Msg>>,
    db: &Sender<Post>,
) {
    let wrap = Msg::new().set_msg_type(MessageType::Create).build();

    for m in &msg.items {
        match m.data {
            Model::Post(ref post) => {
                let (resource, need_db) = create_post_cache(&post, &cash);
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
                    let errors = create_post_db(&post, db, true);
                    println!("[CREATE] <Errors> --> {:?}", errors);
                }
            }
            _ => unimplemented!(),
        }
    }
    send_back(ret_pipe, wrap);
}

#[allow(dead_code)]
fn send_back(return_pipe: &Sender<Arc<Msg>>, msg: Msg) {
    match return_pipe.send(Arc::new(msg)) {
        Ok(val) => println!("[CACHE] Successfully sent return value: {:?}", val),
        Err(e) => println!("[CACHE] Error sending on return pipe: {:?}", e),
    };
}

#[allow(dead_code)]
fn handle_watch(
    msg: &Arc<Msg>,
    cash: &mut RefCellCache,
    ret_pipe: &Sender<Arc<Msg>>,
    db_read: &PgConnection,
    db_write: &Sender<Post>,
) {
    // create a wrapper for the response
    let wrap = Msg::new().set_msg_type(MessageType::Create).build();

    for m in &msg.items {
        println!("MSG ---------------> {:?}", m);

        let mut exists_cache = Option::default();
        let mut exists = false;

        // Check cache if it already exists
        {
            let c = cash.borrow();
            match &m.data {
                Model::Post(post) => {
                    if let Some(val) = c.get(ID::Post(post.id)) {
                        exists_cache = Some(val.clone());
                    };
                }
                Model::User(user) => unimplemented!(),
                Model::Comment(comment) => unimplemented!(),
            }
        }

        // This next section does a few things:
        // @TODO: This can all be simplified. Do so if it comes about at a convenient time.
        match exists_cache {
            Some(val) => {
                exists = val.all_watchers().iter().any(|&x| x == msg.connection_id);
            }
            None => {
                // no value to watch, grab from DB?

                match &m.data {
                    Model::Post(post) => {
                        println!("POST ID# ----> {}", post.id);
                        let post_result = Post::get(post.id, db_read);
                        println!("RAW RESULT: {:?}", post_result);
                        let posts: Option<Vec<Post>> = match post_result {
                            Ok(val) => Some(val),
                            Err(e) => None,
                        };
                        println!("RAW POSTS =====>>>> {:?}", posts);
                        if posts.is_some() {
                            println!("POSTS =====>>>> {:?}", posts);
                            let cleaned_posts_response: Vec<Resource> = posts
                                .unwrap()
                                .into_iter()
                                .map(|post| create_post_cache(&post, &cash))
                                .filter(|(resource, need_db)| *need_db && resource.is_ok())
                                .map(|(resource, _)| resource.unwrap())
                                .filter(|resource| resource.is_some())
                                .map(|resource| resource.unwrap())
                                .collect();
                            println!("cleaned_posts_response: {:?}", cleaned_posts_response);
                        }
                    }
                    Model::User(user) => unimplemented!(),
                    Model::Comment(comment) => unimplemented!(),
                }
            }
        }

        if !exists {
            match &m.data {
                Model::Post(post) => {
                    let mut cache = cash.borrow_mut();
                    let response = cache.get_mut(ID::Post(post.id));
                    match response {
                        Some(val) => {
                            val.add_watch(msg.connection_id);
                            println!(
                                "[CACHE] Current watchers -----------------> {:?}",
                                val.watchers
                            );
                        }
                        None => {
                            println!("ERROR: There was no valid entry for that Post ID.");
                        }
                    }
                }
                Model::User(user) => unimplemented!(),
                Model::Comment(comment) => unimplemented!(),
            }
        }
    }
    send_back(ret_pipe, wrap);
}

#[allow(dead_code)]
fn create_posts(
    output: &mut Vec<Post>,
    cache: RefCellCache,
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
fn create_posts_cache(output: &mut Vec<Post>, cache: RefCellCache) -> Option<Vec<i32>> {
    // let need_fetch = &mut vec![];
    let mapped: Vec<i32> = output
        .into_iter()
        .map(|x| {
            let (last, get) = create_post_cache(&x, &cache);
            last.expect("There was an error Borrowing the cache!");
            (x.id, get)
        })
        .filter(|(_, fetch)| *fetch)
        .map(|(a, _)| a)
        .collect();

    println!("{:?}", mapped);
    Some(mapped)
}

fn create_post_cache(
    post: &Post,
    cache: &RefCellCache,
) -> (Result<Option<Resource>, BorrowMutError>, bool) {
    let mut mut_cache = cache.try_borrow_mut();
    match mut_cache {
        Ok(ref mut val) => {
            match val.put(ID::Post(post.id), Resource::new(Model::Post(post.clone()))) {
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
    msg: &Arc<Msg>,
    cash: &mut RefCellCache,
    ret_pipe: &Sender<Arc<Msg>>,
    db_write: &Sender<Post>,
) {
    let mut cache_mut = cash.borrow_mut();
    let all_watchers = &mut vec![];

    for m in &msg.items {
        {
            println!("M ---------------------> {:?}", *m);
            match &m.data {
                Model::Post(post) => {
                    let resource = cache_mut.get(ID::Post(post.id));
                    if resource.is_some() {
                        // current watchers from Cache
                        let w = resource.unwrap().watchers.to_vec();
                        println!("Watchers --> {:?}", w);
                        all_watchers.push(w);
                    }
                }
                _ => unimplemented!(),
            }
        }
        // insert updates
        match &m.data {
            Model::Post(post) => {
                if let Some(entry) = cache_mut.get_mut(ID::Post(post.id)) {
                    let old_watchers = entry.watchers.clone();
                    let old_version = entry.version;
                    *entry = Resource::new(Model::Post(post.clone()));
                    entry.watchers.clear();
                    entry.watchers.extend(old_watchers);

                    println!("\n************************************************************");
                    println!("Entry of ID:{}, has a version --> {}", post.id, old_version);
                    entry.version = old_version + 1;
                    // entry.increment();
                    println!("New Version: {}", entry.version);
                    println!("************************************************************\n");
                }
            }
            _ => unimplemented!(),
        }
    }

    println!("ALL WATCHERS ------------------> {:?}", all_watchers);

    let mut just_resources: Vec<Resource> = vec![];
    for item in &msg.items {
        match item.data {
            Model::Post(ref post) => {
                let watchers = item.watchers.clone();
                let version = item.version;
                let mut resource = Resource::new(Model::Post(post.clone()));
                watchers.iter().for_each(|watch| resource.add_watch(*watch));
                // resource.add_watch()
                just_resources.push(resource);
            }
            _ => unimplemented!(),
        }
    }

    // create response with...
    //    -  [1] updated data
    //    -  [2] watchers list to send updates to
    let wrap = Msg::new()
        .set_msg_type(MessageType::Create)
        .set_items(&just_resources, all_watchers.as_slice())
        .build();

    // return the watchers ID's, on success writeback to DB..?
    match ret_pipe.send(Arc::new(wrap)) {
        Ok(val) => {
            println!("[CACHE] Result: {:?}", val);
            let posts: Vec<Post> = msg.items
                .iter()
                .map(|item| match item.data {
                    Model::Post(ref post) => post.clone(),
                    _ => unimplemented!(),
                })
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
    fn test_hashmap_cache_index() {
        let db = DB::new();
        let conn = db.get();
        let mut hmc = HashMapCache::new(&db);

        let mut p = Post::new();
        p.id = 1;
        hmc.put(ID::Post(1), Resource::new(Model::Post(p)));

        // check it!
        {
            let result = &hmc[ID::Post(1)];
            println!("HMC [Post(1)] -> {:?}", result);
        }
        {
            let id = 2;
            let mut p = Post::new();
            p.id = id;
            hmc[ID::Post(2)] = Resource::new(Model::Post(p));
        }
        {
            let id = 3;
            let mut u = User::new();
            u.id = id;
            hmc[ID::User(3)] = Resource::new(Model::User(u));
        }
        {
            let id = 4;
            let mut c = Comment::new();
            c.id = id;
            hmc[ID::Comment(4)] = Resource::new(Model::Comment(c));
        }
        println!("Post(2): {:?}", hmc[ID::Post(2)]);
        println!("User(3): {:?}", hmc[ID::User(3)]);
        println!("Comment(4): {:?}", hmc[ID::Comment(4)]);
    }

    // #[test]
    // fn test_selector_extended_get() {
    //     // start db (SAVE only) thread
    //     let (send_db, recv_db) = crossbeam_channel::unbounded();
    //     let db_handle = thread::spawn(move || {
    //         save_posts(recv_db);
    //     });

    //     // start cache + return necessary comm. channels
    //     let (a, b, c): (
    //         crossbeam_channel::Sender<SafeArcMsg>,
    //         crossbeam_channel::Receiver<SafeArcMsg>,
    //         crossbeam_channel::Sender<Cancel>,
    //     ) = wire_up(send_db);

    //     // get
    //     let mut wrap = Wrapper::new()
    //         .set_model(ModelType::Post)
    //         .set_msg_type(MessageType::Get)
    //         .build();

    //     wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
    //     let response = a.send(Arc::new(wrap)).unwrap();
    //     let resp = b.recv();
    // }
    // #[test]
    // fn test_selector_extended_create() {
    //     // start db (SAVE only) thread
    //     let (send_db, recv_db) = crossbeam_channel::unbounded();
    //     let db_handle = thread::spawn(move || {
    //         save_posts(recv_db);
    //     });

    //     // start cache + return necessary comm. channels
    //     let (a, b, c): (
    //         crossbeam_channel::Sender<SafeArcMsg>,
    //         crossbeam_channel::Receiver<SafeArcMsg>,
    //         crossbeam_channel::Sender<Cancel>,
    //     ) = wire_up(send_db);

    //     let mut wrap = Wrapper::new()
    //         .set_model(ModelType::Post)
    //         .set_msg_type(MessageType::Create)
    //         .build();

    //     wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
    //     let response = a.send(Arc::new(wrap)).unwrap();
    //     let resp = b.recv();
    // }
    // // create
    // #[test]
    // fn test_selector_extended_watch() {
    //     // start db (SAVE only) thread
    //     let (send_db, recv_db) = crossbeam_channel::unbounded();
    //     let db_handle = thread::spawn(move || {
    //         save_posts(recv_db);
    //     });

    //     // start cache + return necessary comm. channels
    //     let (a, b, c): (
    //         crossbeam_channel::Sender<SafeArcMsg>,
    //         crossbeam_channel::Receiver<SafeArcMsg>,
    //         crossbeam_channel::Sender<Cancel>,
    //     ) = wire_up(send_db);

    //     let mut wrap = Wrapper::new()
    //         .set_model(ModelType::Post)
    //         .set_msg_type(MessageType::Watch)
    //         .build();

    //     wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
    //     let response = a.send(Arc::new(wrap)).unwrap();
    //     let resp = b.recv();
    // }

    // #[test]
    // fn test_selector_extended_update() {
    //     // start db (SAVE only) thread
    //     let (send_db, recv_db) = crossbeam_channel::unbounded();
    //     let db_handle = thread::spawn(move || {
    //         save_posts(recv_db);
    //     });

    //     // start cache + return necessary comm. channels
    //     let (a, b, c): (
    //         crossbeam_channel::Sender<SafeArcMsg>,
    //         crossbeam_channel::Receiver<SafeArcMsg>,
    //         crossbeam_channel::Sender<Cancel>,
    //     ) = wire_up(send_db);

    //     let mut wrap = Wrapper::new()
    //         .set_model(ModelType::Post)
    //         .set_msg_type(MessageType::Update)
    //         .build();

    //     wrap.items_mut().push(Arc::new(Resource::new(Post::new())));
    //     let response = a.send(Arc::new(wrap)).unwrap();
    //     let resp = b.recv();
    // }

    // #[test]
    // fn test_selector_extended_cancel() {
    //     // start db (SAVE only) thread
    //     let (send_db, recv_db) = crossbeam_channel::unbounded();
    //     let db_handle = thread::spawn(move || {
    //         save_posts(recv_db);
    //     });

    //     // start cache + return necessary comm. channels
    //     let (a, b, c): (
    //         crossbeam_channel::Sender<SafeArcMsg>,
    //         crossbeam_channel::Receiver<SafeArcMsg>,
    //         crossbeam_channel::Sender<Cancel>,
    //     ) = wire_up(send_db);
    //     let cancel = Cancel {
    //         msg: String::from("[Cancel reason]"),
    //     };
    //     let response = c.send(cancel).unwrap();
    //     let resp = b.recv();
    // }

    // #[test]
    // fn test_cache_get() {
    //     let (send_db, recv_db) = crossbeam_channel::unbounded();
    //     let db_handle = thread::spawn(move || {
    //         save_posts(recv_db);
    //     });
    //     let (a, b, c): (
    //         crossbeam_channel::Sender<SafeArcMsg>,
    //         crossbeam_channel::Receiver<SafeArcMsg>,
    //         crossbeam_channel::Sender<Cancel>,
    //     ) = wire_up(send_db);

    //     let mut wrap = Wrapper::new()
    //         .set_model(ModelType::Post)
    //         .set_msg_type(MessageType::Get)
    //         .build();

    //     let mut p = Post::new();
    //     p.id = 1;

    //     wrap.items_mut().push(Arc::new(Resource::new(p)));

    //     match a.send(Arc::new(wrap)) {
    //         Ok(val) => {}
    //         Err(e) => {
    //             println!("[Error] ---> {:?}", e);
    //         }
    //     };

    //     match b.recv() {
    //         Ok(val) => println!("{:?}", val.items()),
    //         Err(e) => {
    //             println!("[Error] ---> {:?}", e);
    //             let ret: String = format!("Error receiving from channel (from cache).");
    //         }
    //     };
    // }
    // #[test]
    // fn test_vec_cache_get() {
    //     let mut vc = AssociativeVecCache::<Resource<Post>>::new();
    //     match vc.put(1, Resource::new(Post::new())) {
    //         Ok(val) => match val {
    //             Some(some) => println!("SOME: {:?}", some),
    //             None => println!("None."),
    //         },
    //         Err(e) => {
    //             println!("There was an error: {:?}", e);
    //         }
    //     }
    //     println!("VC: {:?}", vc);

    //     let mut p = Post::new();
    //     p.id = 1000;
    //     p.likes = 100;
    //     match vc.put(1000, Resource::new(p)) {
    //         Ok(val) => match val {
    //             Some(some) => println!("SOME: {:?}", some),
    //             None => println!("None."),
    //         },
    //         Err(e) => {
    //             println!("There was an error: {:?}", e);
    //         }
    //     }
    //     // println!("VC: {:?}", vc);
    //     println!("***********************************");
    //     println!("GET: {:?}", vc.get(1000));
    //     println!("GET: {:?}", vc[1000]);

    //     {
    //         let mutable_vc_entry = &mut vc[1];
    //         mutable_vc_entry.get_data_mut().id = 9999;
    //     }
    //     println!("Mutable_VC_ENTRY.ID: {:?}", vc[1]);
    // }
}
