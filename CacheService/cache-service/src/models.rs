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

#[derive(Debug)]
pub struct Resource<T> {
    /// Watchers: These keep track of all the users that are watching this
    /// peice of data. 
    /// 
    pub watchers: Rc<HashMap<i32, User>>,

    /// Data: Where the data is actually stored. Generically, of course.
    /// 
    pub data: T,

    /// Version: [u32; 3] is...
    /// 
    /// something along the lines of [browser, cache, db]
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

impl<'a, T> Resource<T> {
    pub fn new(inner: T) -> Resource<T> {
        Resource::<T>{
            data: inner,
            watchers: Rc::new(HashMap::new()),
            version: [0, 0, 0],
        }
    }
    pub fn increment(&mut self) {
        self.version[1] = self.version[1]+1;
    }
}

impl PartialEq for Resource<Post> {
    fn eq(&self, other: &Resource<Post>) -> bool {
        self.data.id == other.data.id
    }
}
impl Eq for Resource<Post> {}


pub enum MessageType {
    Watch=0,
    Create,
    Update,
    Double,
    Get,
}

pub trait Model {
    type model;
    fn id(&self) -> i32;
    fn me(&self) -> &Self::model;
    fn save(&mut self) -> bool;
}



/// Message<T> is a wrapper for defining messages for communication
/// with this very service. 
#[allow(unused_variables)]
pub struct Message<T> where
    T: Model
{
    pub data: T,
    pub msg_type: MessageType,
    pub timestamp: i32,
    pub version: [i32; 3],
}

pub struct Cache {
    // using classical generics and predefined models
    pub posts: HashMap<String, Resource<Post>>,
    pub users: HashMap<String, Resource<User>>,
    pub comments: HashMap<String, Resource<Comment>>,
    
    // using trait objects -- This uses vtable lookups at runtime as appose
    // to the much quicker standard method. It is relatively clean but also requires
    // separate implementations for each model, even if they are largely copy/pasted.
    // data: HashMap<String, &'a Resource>,
}

impl Cache {
    pub fn new() -> Cache {
        Cache {
            posts: HashMap::new(),
            users: HashMap::new(),
            comments: HashMap::new(),
        }
    }
    pub fn get_post(&mut self, key: String) -> Option<&Resource<Post>> {
        return self.posts.get(&key);
    }
    pub fn set_post(&mut self, key: String, val: Post) -> Option<Resource<Post>> {
        let model = Resource::new(val);
        self.posts.insert(key, model)
    }
    pub fn update_post(&mut self, key: String, new_post: &mut Post) {
        self.posts.entry(key).and_modify(new_post);
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
pub struct Post{
    pub id: i32,
    pub username: String,
}

impl Model for Post {
    type model = Post;
    fn id(&self) -> i32 {
        self.id
    }
    fn me(&self) -> &Self::model {
        self
    }
    fn save(&mut self) -> bool {
        true
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
    use std::any::TypeId;
    use std::any::Any;
    use std;

    pub fn typeid<T: Any>(_: &T) -> TypeId {
        TypeId::of::<T>()
    }
    // just 'test' tests.. 
    #[test]
    fn test_post() {
        let p = models::Post{id: 1, username: String::from("bryandmc")};
        assert_eq!(models::Post{id: 1, username: String::from("bryandmc")}, p)
    }

    #[test]
    fn test_new_model() {
        let m = models::Resource::new(models::Post{id: 1, username: String::from("bryandmc")});
        let typ = typeid(&m);
        println!("{:?}", typ);
        assert_eq!(std::any::TypeId::of::<models::Resource<models::Post>>(), typ);
    }
} 