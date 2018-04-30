use std::collections::HashMap;

/**
 *  This
 */
pub struct User {
    pub pk: i64,
    pub username: String,
    pub email: String,
    // etc..
    // assumes the value for a watch is a string temporarily
    pub watches: Vec<Watch<String>>,
}

impl User {
    pub fn new(pk: i64, username: String, email: String) -> User {
        User {
            pk: pk,
            username: username,
            email: email,
            watches: vec![Watch::<String> {
                id: 0,
                watch_type: WatchType::Post,
                value: String::from(""),
            }],
        }
    }
}

pub struct Model {}
pub struct Field {}

pub struct WatchValue {
    model: Model,
    field: Field,
    identifiers: Vec<String>,
}

pub struct Watch<V> {
    pub id: i64, // the ID of the WATCH, not the thing being watched
    pub watch_type: WatchType,
    pub value: V, // will depend on what kind of value you are watching
}

pub struct ConnRef {
    pub user: User,
}

pub enum WatchType {
    Post,
    PostList,
    UserProfile,
    // etc...
}

pub struct Nexus {
    pub id: i8, // not gonna be many if even more than 1
    pub users: Vec<User>,
    pub connections: HashMap<i32, ConnRef>,
}
