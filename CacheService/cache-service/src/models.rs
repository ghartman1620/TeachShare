use serde_json::from_str;
use serde_json::Value;
use std::cmp::{Eq, PartialEq};
use std::error;
use std::fmt;
use std::hash::Hash;
use std::sync::Arc;

// #[derive(Debug)]
// pub struct NoIDProvided {
//     details: String,
// }

// impl NoIDProvided {
//     pub fn new(msg: &str) -> NoIDProvided {
//         NoIDProvided {
//             details: msg.to_string(),
//         }
//     }
// }

// #[derive(Debug)]
// pub enum CacheError {
//     NoIDProvided(),
// }

/// Error Trait definition:
///
/// pub trait Error: Debug + Display {
///     fn description(&self) -> &str;
///     fn cause(&self) -> Option<&Error> { ... }
/// }
// impl error::Error for NoIDProvided {
//     fn description(&self) -> &str {
//         println!("No ID (pk) provided for request");
//         "No ID (pk) provided for request"
//     }
//     // fn cause(&self) -> Option<&error::Error> {
//     //     let res = NoIDProvided::new("No ID (pk) was provided");
//     //     Some(&res)
//     // }
// }

// impl fmt::Display for NoIDProvided {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         write!(f, "No ID provided.")
//     }
// }

#[derive(Debug)]
pub struct UserPermission {
    pub id: i32,
    pub object_id: Model,
    pub permission: Permission,
    pub user: i32,
}

#[derive(Debug)]
pub enum Permission {
    view_post(bool),
    // etc...
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Model {
    User(User),
    Post(Post),
    Comment(Comment),
}

#[derive(Debug, Eq, PartialEq, Hash)]
pub enum ID {
    Post(i32),
    User(i32),
    Comment(i32),
    Permission(i32),
}

#[derive(Debug, Clone)]
pub struct Resource {
    /// Watchers: These keep track of all the users that are watching this
    /// peice of data.
    ///
    pub watchers: Vec<i32>,
    /// Data: Where the data is actually stored. Generically, of course.
    ///
    pub data: Model,

    /// Version: the id of the most recent update to a post.
    pub version: u64,
}

impl Resource {
    pub fn new(inner: Model) -> Resource {
        Resource {
            data: inner,
            watchers: vec![],
            version: 0,
        }
    }
    pub fn increment(&mut self) {
        self.version = self.version + 1;
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IdAndVersion {
    pub id: i32,
    pub version: u64,
}

#[derive(Debug, Clone, Serialize, Eq, PartialEq, Deserialize)]
pub enum MessageType {
    Watch,
    Manifest,
    Create,
    Update,
    Get,
}

#[derive(Debug, Clone)]
pub enum ModelType {
    Post = 0,
    User,
    Comment,
}

// pub type Arc<Msg> = Arc<Item + Send + Sync>;
// pub type ArcType<T: Item + Send + Sync> = Arc<T>;

#[derive(Clone)]
pub struct Msg {
    pub msg_type: MessageType,
    pub timestamp: i32,
    pub items: Vec<Arc<Resource>>,
    pub errors: Vec<String>,
    pub connection_id: i32,
}

/// Wrapper implements the Msg trait so it can be used generically. It also uses the
/// common standard library/crate pattern for building objects calle the 'builder pattern'.
/// This can be found at: https://abronan.com/rust-trait-objects-box-and-rc/
impl Msg {
    pub fn new() -> Msg {
        Msg {
            msg_type: MessageType::Get,
            timestamp: 0,
            items: vec![],
            errors: vec![],
            connection_id: 0,
        }
    }
    pub fn set_msg_type(&mut self, msg_type: MessageType) -> &mut Self {
        self.msg_type = msg_type;
        self
    }
    pub fn add_error(&mut self, err: String) -> &mut Self {
        self.errors.push(err);
        self
    }
    pub fn set_items(&mut self, items: &Vec<Resource>, watchers: &[Vec<i32>]) -> &mut Self {
        // Generate a temporary value, iterate though it, zipping it together
        // with the watchers, mapping them both to generate a new Resource
        // with the correct watchers. This sort of data-gymnastics was necessary
        // to be able to set the items of a wrapper, including watchers in one go.
        let temp = items
            .iter()
            .zip(watchers.iter())
            .map(|(post, watchers)| {
                let temp = &mut Arc::new(post.clone()); // @Clone
                let resource = Arc::get_mut(temp).expect("Could not borrow mutably.");

                watchers.iter().for_each(|watch| {
                    resource.add_watch(watch.clone());
                });
                Arc::new(resource.clone())
            })
            .collect::<Vec<_>>();

        // @TODO: avoid this extra loop if possible.
        let mut actual: Vec<Arc<Resource>> = vec![];
        for a in temp {
            actual.push(a.clone());
        }

        // finally, actually assign the generated vector of Resource<_> to the
        // self.items of this .. object..? What would you call an instantiation
        // of a struct in rust..? Not an object, surely...
        self.items = actual;
        self
    }

    /// Termination of the builder-pattern to return a fully owned clone of the
    /// built up wrapper.
    pub fn build(&mut self) -> Msg {
        self.clone()
    }
}

// pub trait Msg<'a> {
//     fn data_type(&self) -> ModelType;
//     fn msg_type(&self) -> MessageType;
//     fn timestamp(&self) -> i32;
//     fn items(&self) -> &Vec<Arc<Msg>>;
//     fn items_mut(&mut self) -> &mut Vec<Arc<Msg>>;
//     fn has_error(&self) -> bool;
//     fn errors(&self) -> &Vec<String>;
//     fn errors_mut(&mut self) -> &mut Vec<String>;
//     fn get_connection_id(&self) -> i32;
// }

// impl<'a> fmt::Debug for Msg<'a> + Send + Sync {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         write!(f, "[{:?}] -> {:?}", self.msg_type(), self.items())
//     }
// }

// impl fmt::Debug for Item + Send + Sync {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         write!(
//             f,
//             "[Post] -> {:?}, [Watchers] -> {:?}",
//             self.get_data(),
//             self.get_watchers()
//         )
//     }
// }

// impl<'a> Msg<'a> {
//     // what do I do here?
// }

// impl<'a> Msg<'a> for Wrapper {
//     fn data_type(&self) -> ModelType {
//         self.model_type.clone()
//     }
//     fn msg_type(&self) -> MessageType {
//         self.msg_type.clone()
//     }
//     // fn data(&self) -> Self;
//     fn timestamp(&self) -> i32 {
//         self.timestamp
//     }
//     fn items(&self) -> &Vec<Arc<Msg>> {
//         &self.items
//     }
//     fn items_mut(&mut self) -> &mut Vec<Arc<Msg>> {
//         &mut self.items
//     }
//     fn has_error(&self) -> bool {
//         self.errors.len() > 0
//     }
//     fn errors(&self) -> &Vec<String> {
//         &self.errors
//     }
//     fn errors_mut(&mut self) -> &mut Vec<String> {
//         &mut self.errors
//     }
//     fn get_connection_id(&self) -> i32 {
//         self.connection_id
//     }
// }

// pub trait Item {
//     fn new(&self, post: Post, watchers: Vec<i32>) -> Resource<Post>;
//     fn get_data(&self) -> &Post;
//     fn get_data_mut(&mut self) -> &mut Post;
//     fn get_data_clone(&self) -> Post;
//     fn get_watchers(&self) -> &Vec<i32>;
//     fn get_watchers_mut(&mut self) -> &mut Vec<i32>;
//     fn get_version(&self) -> u64;
// }

// pub type PostResource = Resource<Post>;

// impl Item for Resource<Post> {
//     fn new(&self, post: Post, watchers: Vec<i32>) -> Resource<Post> {
//         let mut resource = Resource::new(post);
//         resource.watchers = watchers;
//         resource
//     }
//     fn get_data(&self) -> &Post {
//         &self.data
//     }
//     fn get_data_mut(&mut self) -> &mut Post {
//         &mut self.data
//     }
//     fn get_data_clone(&self) -> Post {
//         self.data.clone()
//     }
//     fn get_watchers(&self) -> &Vec<i32> {
//         &self.watchers
//     }
//     fn get_watchers_mut(&mut self) -> &mut Vec<i32> {
//         &mut self.watchers
//     }
//     fn get_version(&self) -> u64 {
//         self.version
//     }
// }

#[derive(Queryable, Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct User {
    pub id: i32,
    password: String,
    // last_login: Option<PgTimestamp>,
    pub is_superuser: bool,
    pub username: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub is_staff: bool,
    pub is_active: bool,
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
    pub post_id: i32,
    pub user_id: i32,
}

impl Comment {
    pub fn new() -> Comment {
        Comment {
            id: 1,
            text: String::from(""),
            post_id: 1,
            user_id: 1,
        }
    }
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
    use std::collections::HashMap;

    pub fn typeid<T: Any>(_: &T) -> TypeId {
        TypeId::of::<T>()
    }

    #[test]
    fn test_enum_model() {
        let p = Post::new();
        let post = F::Post(p);
        let mut x = vec![];
        x.push(post);
        x.push(F::User(User::new()));
        x.push(F::Comment(Comment::new()));

        let mut hm: HashMap<ID, F> = HashMap::new();
        hm.insert(ID::Post(1), F::Post(Post::new()));
        hm.insert(ID::Comment(2), F::Comment(Comment::new()));
        hm.insert(ID::User(2), F::User(User::new()));
        hm.insert(ID::Post(2), F::Post(Post::new()));

        println!("HM: {:?}", hm[&ID::Post(1)]);

        println!("Typed HASHMAP: {:?}", hm);
        for (a, b) in &hm {
            println!(" Entry ---> {:?}: {:?}", a, b);
            match a {
                ID::Post(id) => println!("{:?}", id),
                ID::Comment(id) => println!("{:?}", id),
                _ => println!("Other..."),
            }
        }

        println!("X --------------> {:?}", x);
        for y in &mut x {
            println!("Y: {:?}", y);
            match y {
                F::Post(ref mut p) => {
                    println!("This is a post with id: {:?}", p.id);
                    println!("Post Content: {:?}", p.content);
                    p.id = 1;
                    println!("This is a post with id: {:?}", p.id);
                }
                F::User(u) => println!("This is a user: {:?}", u),
                F::Comment(c) => println!("This is a comment: {:?}", c),
                _ => println!("This is everything else..."),
            }
        }
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
        assert_eq!(m.version, 1);
    }
}
