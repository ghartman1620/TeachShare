// use diesel::pg::data_types::{PgTimestamp, PgInterval};
// use serde_json::value::Value;

use std::cmp::{Eq, PartialEq};
use std::collections;
use std::collections::HashMap;
use std::cell::RefCell;
use std::rc::Rc;

/**
 *  This
 */
#[derive(Clone, Debug)]
pub struct User {
    pub id: i32,
    password: String,
    // last_login: Option<PgTimestamp>,
    is_superuser: bool,
    pub username: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub is_staff: bool,
    pub is_active: bool,
    // date_joined: PgTimestamp,
}

impl PartialEq for User {
    fn eq(&self, other: &User) -> bool {
        self.id == other.id
    }
}
impl Eq for User {}

impl User {
    pub fn new() -> User {
        User {
            id: 0,
            password: String::from(""),
            // last_login: Option::from(PgTimestamp(0)),
            is_superuser: false,
            username: String::from(""),
            first_name: String::from(""),
            last_name: String::from(""),
            email: String::from(""),
            is_staff: false,
            is_active: false,
            // date_joined: PgTimestamp(0),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Resource<T> {
    /// Watchers: These keep track of all the users that are watching this
    /// peice of data.
    ///
    pub watchers: HashMap<i32, User>,

    /// Data: Where the data is actually stored. Generically, of course.
    ///
    pub data: T,

    /// Version is something along the lines of [browser, cache, db]
    /// to keep track of which version this current data is.
    /// Although it could be done using a single integer, having actual
    /// 'mutators' identified allows for a finer grained decision making
    /// process when it comes to WHICH value to keep/save as most 'current'.
    ///
    /// ```
    /// version = [1, 0, 0];
    /// ```
    ///
    version: [u32; 3],
}

impl<'a, T> Resource<T> {
    pub fn new(inner: T) -> Resource<T> {
        Resource::<T> {
            data: inner,
            watchers: HashMap::new(),
            version: [0, 0, 0],
        }
    }
    pub fn increment(&mut self) {
        self.version[1] = self.version[1] + 1;
    }
    pub fn add_watch(&mut self, user: User) -> Option<User> {
        self.watchers.insert(user.id, user)
    }

    /// remove_watch: remove's a watch from the watchers map
    pub fn remove_watch(&mut self, user_id: i32) -> Option<User> {
        self.watchers.remove(&user_id)
    }

    /// all_watchers: goal is to get a vector of copy'd user's
    pub fn all_watchers(&mut self) -> Vec<User> {
        let out: &mut Vec<User> = &mut vec![];
        let temp = self.watchers.clone();
        for (_, user) in temp.iter() {
            out.push(user.clone());
        }
        return out.clone();
    }

    /// watchers_to_iter: gives an iterator from the watchers list
    pub fn watchers_to_iter(&self) -> collections::hash_map::Iter<i32, User> {
        self.watchers.iter()
    }
}

impl PartialEq for Resource<Post> {
    fn eq(&self, other: &Resource<Post>) -> bool {
        self.data.id == other.data.id
    }
}
impl Eq for Resource<Post> {}

#[derive(Debug, Clone)]
pub enum MessageType {
    Watch = 0,
    Create,
    Update,
    Get,
}

#[derive(Debug, Clone)]
pub enum CommandType {
    Exit = 0,
}

#[derive(Debug, Clone)]
pub enum ModelType {
    Post = 0,
    User,
    Comment,
}

pub enum Operation {
    Add = 0,
}

#[derive(Debug, Clone)]
pub enum Data {
    Post,
    User,
    Comment,
}

type RcItem = Rc<Item>;
pub struct Wrapper {
    pub model_type: ModelType,
    pub msg_type: MessageType,
    pub timestamp: i32,
    pub items: Vec<RcItem>, 
}

pub trait Msg<'a> {
    fn data_type(&self) -> ModelType;
    fn msg_type(&self) -> MessageType;
    // fn data(&self) -> Self;
    fn timestamp(&self) -> i32;
    fn items(&self) -> &Vec<RcItem>;
}

impl<'a> Msg<'a> {
    // what do I do here?
}

impl<'a> Msg<'a> for Wrapper {
    fn data_type(&self) -> ModelType {
        return self.model_type.clone();
    }
    fn msg_type(&self) -> MessageType {
        return self.msg_type.clone();
    }
    // fn data(&self) -> Self;
    fn timestamp(&self) -> i32 {
        return self.timestamp;
    }
    fn items(&self) -> &Vec<RcItem> {
        return &self.items;
    }
}

pub trait Item {
    fn get_data(&self) -> &Post;
    fn get_data_mut(&mut self) -> &mut Post;
    fn get_watchers(&self) -> &HashMap<i32, User>;
    fn get_watchers_mut(&mut self) -> &mut HashMap<i32, User>;
    fn get_version(&self) -> [u32; 3];
}

type PostResource = Resource<Post>;

impl Item for PostResource {
    fn get_data(&self) -> &Post {
        return &self.data;
    }
    fn get_data_mut(&mut self) -> &mut Post {
        return &mut self.data;
    }
    fn get_watchers(&self) -> &HashMap<i32, User> {
        return &self.watchers;
    }
    fn get_watchers_mut(&mut self) -> &mut HashMap<i32, User> {
        return &mut self.watchers;
    }
    fn get_version(&self) -> [u32; 3] {
        return self.version;
    }
    
}

/// Message<T> is a wrapper for defining messages for communication
/// with this very service.
#[derive(Debug, Clone)]
pub struct Message<T>
where
    T: Model + Clone,
{
    pub data: T,
    pub msg_type: MessageType,
    // pub operation: Operation,
    pub timestamp: i32,
    pub version: [i32; 3],
}


impl<T> Message<T> where 
    T: Model + Clone,
{
    pub fn new() -> Message<T> {
        Message {
            data: T::new(),
            // data_type: ModelType::Post,
            msg_type: MessageType::Get,
            timestamp: 0,
            version: [0,0,0],
        }
    }
}

#[derive(Debug)]
pub struct Command<T> {
    pub cmd_type: CommandType,
    pub value: T,
}

type ModelTable<T> = RefCell<HashMap<i32, Resource<T>>>;

#[derive(Debug, Clone)]
pub struct Cache<T> {
    // using classical generics and predefined models
    pub _data: ModelTable<T>,
}

impl<'a, T> Cache<T> 
where
    T: Model,
{
    pub fn new() -> Cache<T> {
        Cache {
            _data: RefCell::from(HashMap::new()),
        }
    }
    pub fn get(self, key: i32) /*-> Option<&'a Resource<T>>*/ {
        let temp = self._data;
        let selfy = temp.borrow();
        let result = selfy.get(&key).unwrap();
        // println!("{:?}", result.id());
    }
    pub fn set(&mut self, key: i32, new_post: T) -> Option<Resource<T>> {
        let model = Resource::new(new_post);
        let mut selfy = self._data.borrow_mut();
        let res = selfy.insert(key, model);
        res
    }
    pub fn update(&'static mut self, key: i32, new_post: T) -> bool {
        let mut temp = self._data.borrow_mut(); 
        let prev = temp.get_mut(&key).unwrap();
        *prev = Resource::new(new_post);
        true
    }
}

#[derive(Debug, Clone, PartialEq, Eq)] // , PartialEq, Eq
pub struct Post {
    pub id: i32,
    pub title: String,
    // pub content: Value,
    // pub updated: PgTimestamp,
    pub likes: i32,
    // pub timestamp: PgTimestamp,
    // pub tags: Value,
    pub user_id: i32,
    pub draft: bool,
    pub content_type: i32,
    pub grade: i32,
    // pub length: PgInterval,
    pub subject: i32,
    pub crosscutting_concepts: Vec<i32>,
    pub disciplinary_core_ideas: Vec<i32>,
    pub practices: Vec<i32>,
}

impl Post {
    pub fn new() -> Post {
        Post {
            id: 0,
            title: String::from(""),
            // content: Value::Null,
            // updated: PgTimestamp(0),
            likes: 0,
            // timestamp: PgTimestamp(0),
            // tags: Value::Array(vec!()),
            user_id: 0,
            draft: false,
            content_type: 0,
            grade: 0,
            // length: PgInterval::new(0, 0, 0),
            subject: 0,
            crosscutting_concepts: vec![],
            disciplinary_core_ideas: vec![],
            practices: vec![],
        }
    }
}

pub trait Model {
    type model;
    fn id(&self) -> i32;
    fn new() -> Self;
    fn data(self) -> Self where 
        Self: Sized,
    {
        return self;
    }
    fn inner(self) -> Self where 
        Self: Sized,
    {
        return self;
    }
}

impl Model for Post {
    type model = Post;
    fn id(&self) -> i32 {
        self.id
    }
    fn new() -> Post {
        Post::new()
    }
    fn inner(self) -> Self where 
        Self: Sized,
    {
        return self;
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
pub struct Comment {
    pub id: i32,
    pub text: String,
}

#[cfg(test)]

mod tests {
    use models;
    use models::*;
    use std;
    use std::any::Any;
    use std::any::TypeId;

    pub fn typeid<T: Any>(_: &T) -> TypeId {
        TypeId::of::<T>()
    }
    // just 'test' tests..
    #[test]
    fn test_post() {
        let p = models::Post::new();
        assert_eq!(models::Post::new(), p)
    }

    #[test]
    fn test_new_model() {
        let m = models::Resource::new(models::Post::new());
        let typ = typeid(&m);
        println!("{:?}", typ);
        assert_eq!(
            std::any::TypeId::of::<models::Resource<models::Post>>(),
            typ
        );
    }

    #[test]
    fn test_model_post() {
        let p = models::Post::new();
        // p.data();
    }

    #[test]
    fn test_msg_struct() {
        let mut msg = Wrapper {
            model_type: ModelType::Post,
            msg_type: MessageType::Get,
            timestamp: 0,
            items: vec!(),
        };
        let resource = Rc::new(PostResource{
            data: Post::new(),
            watchers: HashMap::new(),
            version: [0, 0, 0],
        });
        
        let r = resource.clone();
        msg.items.push(resource);
        msg.items.push(r);
        for a in &msg.items {
            println!("{:?}", a.get_data());
        }
        // println!("{:?}", msg.items);
    }
}
