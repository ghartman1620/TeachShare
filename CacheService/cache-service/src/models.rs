
use serde_json::Value;
use std::cmp::{Eq, PartialEq};
use std::sync::Arc;
use std::fmt;


#[derive(Debug, Clone)]
pub struct Resource<T> {
    /// Watchers: These keep track of all the users that are watching this
    /// peice of data.
    ///
    pub watchers: Vec<i32>,

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
            watchers: vec!(),
            version: [0, 0, 0],
        }
    }
    pub fn increment(&mut self) {
        self.version[1] = self.version[1] + 1;
    }
    pub fn add_watch(&mut self, id: i32) {
        self.watchers.push(id)
    }

    /// remove_watch: remove's a watch from the watchers map
    pub fn remove_watch(&mut self, id: i32) {
        self.watchers.remove_item(&id).unwrap();
    }

    /// all_watchers: goal is to get a vector of copy'd user's
    pub fn all_watchers(&self) -> &Vec<i32> {
        &self.watchers
    }
}

impl PartialEq for Resource<Post> {
    fn eq(&self, other: &Resource<Post>) -> bool {
        self.data.id == other.data.id
    }
}
impl Eq for Resource<Post> {}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

pub type ArcItem = Arc<Item + Send + Sync>;

#[derive(Clone)]
pub struct Wrapper {
    pub model_type: ModelType,
    pub msg_type: MessageType,
    pub timestamp: i32,
    pub items: Vec<ArcItem>,
    pub errors: Vec<String>,
    pub connection_id: i32,
}

/// Wrapper implements the Msg trait so it can be used generically. It also uses the
/// common standard library/crate pattern for building objects calle the 'builder pattern'.
/// This can be found at: https://abronan.com/rust-trait-objects-box-and-rc/
impl Wrapper {
    pub fn new() -> Wrapper {
        Wrapper {
            model_type: ModelType::Post,
            msg_type: MessageType::Get,
            timestamp: 0,
            items: vec![],
            errors: vec![],
            connection_id: 0,
        }
    }
    pub fn set_model(&mut self, model: ModelType) -> &mut Self {
        self.model_type = model;
        self
    }
    pub fn set_msg_type(&mut self, msg_type: MessageType) -> &mut Self {
        self.msg_type = msg_type;
        self
    }
    pub fn build(&mut self) -> Wrapper {
        self.clone()
    }
 }

pub trait Msg<'a> {
    fn data_type(&self) -> ModelType;
    fn msg_type(&self) -> MessageType;
    // fn data(&self) -> Self;
    fn timestamp(&self) -> i32;
    fn items(&self) -> &Vec<ArcItem>;
    fn items_mut(&mut self) -> &mut Vec<ArcItem>;
    fn hasErr(&self) -> bool;
    fn errors(&self) -> &Vec<String>;
    fn errors_mut(&mut self) -> &mut Vec<String>;
    fn get_connection_id(&self) -> i32;
}

impl<'a> fmt::Debug for Msg<'a> + Send + Sync {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{:?}] -> {:?}", self.msg_type(), self.items())
    }
}

impl fmt::Debug for Item + Send + Sync {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[Post] -> {:?}, [Watchers] -> {:?}", self.get_data(), self.get_watchers())
    }
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
    fn items(&self) -> &Vec<ArcItem> {
        return &self.items;
    }
    fn items_mut(&mut self) -> &mut Vec<ArcItem> {
        return &mut self.items;
    }
    fn hasErr(&self) -> bool {
        return self.errors.len() > 0;
    }
    fn errors(&self) -> &Vec<String> {
        return &self.errors;
    }
    fn errors_mut(&mut self) -> &mut Vec<String> {
        return &mut self.errors;
    }
    fn get_connection_id(&self) -> i32 {
        return self.connection_id;
    }
}


pub trait Item {
    fn get_data(&self) -> &Post;
    fn get_data_mut(&mut self) -> &mut Post;
    fn get_data_clone(&self) -> Post;
    fn get_watchers(&self) -> &Vec<i32>;
    fn get_watchers_mut(&mut self) -> &mut Vec<i32>;
    fn get_version(&self) -> [u32; 3];
}

pub type PostResource = Resource<Post>;

impl Item for PostResource {
    fn get_data(&self) -> &Post {
        return &self.data;
    }
    fn get_data_mut(&mut self) -> &mut Post {
        return &mut self.data;
    }
    fn get_data_clone(&self) -> Post {
        return self.data.clone();
    }
    fn get_watchers(&self) -> &Vec<i32> {
        return &self.watchers;
    }
    fn get_watchers_mut(&mut self) -> &mut Vec<i32> {
        return &mut self.watchers;
    }
    fn get_version(&self) -> [u32; 3] {
        return self.version;
    }
}

#[derive(Queryable, Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct User {
    id: i32,
    password: String,
    // last_login: Option<PgTimestamp>,
    is_superuser: bool,
    pub username: String,
    first_name: String,
    last_name: String,
    email: String,
    is_staff: bool,
    is_active: bool,
    // date_joined: PgTimestamp,
}

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

#[derive(Queryable, Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Comment {
    pub id: i32,
    pub text: String,
    // timestamp: PgTimestamp,
    post_id: i32,
    user_id: i32,
}

#[derive(Queryable, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub content: Value,
    // pub updated: PgTimestamp,
    pub likes: i32,
    // pub timestamp: PgTimestamp,
    pub tags: Value,
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

    // a few of the tests below are pointless, keep that in mind
    #[test]
    fn test_post() {
        let p = models::Post::new();
        assert_eq!(models::Post::new(), p)
    }

    #[test]
    fn test_new_model() {
        let m = models::Resource::new(models::Post::new());
        let typ = typeid(&m);
        assert_eq!(
            std::any::TypeId::of::<models::Resource<models::Post>>(),
            typ
        );
    }

    #[test]
    fn test_resource_init() {
        let p = models::Post::new();
        let m = &mut models::Resource::<models::Post>::new(p);
    }
    #[test]
    fn test_resource_add_watch() {
        let p = models::Post::new();
        let m = &mut models::Resource::<models::Post>::new(p);

        m.add_watch(1);
        m.add_watch(2);
        {
            let all = m.all_watchers();
            assert_eq!(*all, vec![1, 2]);
            // let t = m.data;
        }
    }
    #[test]
    fn test_resource_remove_watch() {
        let p = models::Post::new();
        let m = &mut models::Resource::<models::Post>::new(p);

        m.add_watch(1);
        m.add_watch(2);
        {
            let all = m.all_watchers();
            assert_eq!(*all, vec![1, 2]);
            // let t = m.data;
        }
        m.remove_watch(1);
        assert_eq!(m.watchers, vec![2]);

        m.increment();
        assert_eq!(m.version, [0,1,0]);
    }
}
