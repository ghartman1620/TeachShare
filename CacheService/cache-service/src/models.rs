extern crate serde;
extern crate serde_json;

use std::cmp::{Eq, PartialEq};
use std::collections::HashMap;
use std::rc::Rc;

/**
 *  This
 */
#[derive(Serialize, Deserialize, Hash, Debug)]
pub struct User {
    pub pk: i64,
    pub username: String,
    pub email: String,
}

impl PartialEq for User {
    fn eq(&self, other: &User) -> bool {
        self.pk == other.pk
    }
}
impl Eq for User {}

impl User {
    pub fn new(pk: i64, username: String, email: String) -> User {
        User {
            pk: pk,
            username: username,
            email: email,
        }
    }
}

// pub struct Resource <T> {
//     watchers: HashMap<i32, User>,
//     data: T, // alternatively a [u8] or Vec<u8> would work for holding data
// }

#[derive(Serialize, Deserialize, Hash, Debug)]
pub struct Field {}

// This is WHAT the watch is watching...
#[derive(Serialize, Deserialize, Hash, Debug)]
pub enum WatchType {
    Post,
    UserProfile,
    // etc...
}

pub struct WatchValue {
    field: Field,
    watch_type: WatchType,
    data: Box<Resource>,
}

#[derive(Debug)]
pub struct Model<T> {
    /// Watchers: These keep track of all the users that are watching this
    /// peice of data. 
    /// 
    pub watchers: Rc<HashMap<i32, User>>,

    /// Data: Where the data is actually stored. Generically, of course.
    /// 
    pub data: T,

    /// Version: [u32; 3] is...
    /// 
    /// something along the linse of [browser, cache, db]
    /// to keep track of which version this current data is.
    /// Although it could be done using a single integer, having actual
    /// 'mutators' identified allows for a finer grained decision making
    /// process when it comes to WHICH value to keep/save as most 'current'.
    ///
    /// using unsigned ints because therre's no such thing as a negative
    /// version.
    /// 
    version: [u32; 3],
}

impl<'a, T> Model<T> {
    pub fn new(inner: T) -> Model<T> {
        Model::<T>{
            data: inner,
            watchers: Rc::new(HashMap::new()),
            version: [0, 0, 0],
        }
    }
    pub fn increment(&mut self) {
        self.version[1] = self.version[1]+1;
    }

}


pub trait Resource {
    fn watchers(&self);
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Post{
    pub id: i32,
    pub username: String,
}

pub struct PostModel {
    pub data: Post,
    pub watchers: Vec<User>,
}
impl PostModel {
    pub fn watchers(self) -> Vec<User> {
        return self.watchers;
    }
    pub fn new(&self) -> PostModel {
        PostModel{
            data: Post{id: 1, username: String::from("bryan")},
            watchers: vec!(),
        }
    }
}



pub struct Cache<'a> {
    // using trait objects -- This uses vtable lookups at runtime as appose
    // to the much quicker standard method. It is relatively clean but also requires
    // separate implementations for each model, even if they are largely copy/pasted.
    data: HashMap<String, &'a Resource>,

    // using classical generics and predefined models
    posts: HashMap<String, Model<Post>>,
    users: HashMap<String, &'a Model<User>>,
}

impl<'a> Cache<'a> {
    pub fn new() -> Cache<'a> {
        Cache {
            data: HashMap::new(),

            posts: HashMap::new(),
            users: HashMap::new(),
        }
    }
    pub fn get_post(&mut self, key: String) -> Option<&Model<Post>> {
        return self.posts.get(&key);
    }
    pub fn set_post(&mut self, key: String, val: Post) -> Option<Model<Post>> {
        let model = Model::new(val);
        self.posts.insert(key, model)
    }
}

pub struct UserModel {
    data: User,
    watchers: Vec<User>,
}
impl UserModel {
    pub fn watchers(self) -> Vec<User> {
        return self.watchers;
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Watch {
    pub id: i64, // the ID of the WATCH, not the thing being watched
                 // pub value: WatchValue, // will depend on what kind of value you are watching
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConnRef {
    pub user: User,
}

pub struct Nexus {
    pub id: i8, // not gonna be many if even more than 1

    // @TODO: change to posts with users connected
    // pub users: Vec<User>,
    pub resources: Vec<Box<Resource>>,
    pub connections: HashMap<i32, ConnRef>,
}

