use db::{DBError, DB};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use schema::posts_post;
use serde_json::Value;
use std::cmp::{Eq, PartialEq};
use std::collections::HashSet;
use std::hash::{Hash, Hasher};
use std::ops::{Add, AddAssign};
use std::sync::Arc;
use users::User;

// * option 1
#[derive(Debug, Serialize)]
pub struct WSMessageResponse<'a> {
    versions: &'a [u64],
    payload: &'a [Model],
}

impl<'a> WSMessageResponse<'a> {
    pub fn new(payload: &'a [Model], versions: &'a [u64]) -> WSMessageResponse<'a> {
        WSMessageResponse { payload, versions }
    }
}

// * option 2
#[derive(Debug, Serialize)]
pub struct WSMsgResponse<'a>(u64, &'a Model);

/// This is the Value field for entries in the cache. They can be
/// matched by their type, and then return the value as
/// the parameter.
///
/// Implementation note: This will always be exactly the size of the
/// largest struct. Luckily most of the large fields are simple
/// strings/json and are referred to via reference. So their actual
/// size isn't that bad.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Model {
    User(User),
    Post(Post),
    Comment(Comment),
}

// This is KEY field for HashMap entries that make it so that we can still refer
// to an entry only by their id (pk), and have no collision with different types.
#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub enum ID {
    Post(i32),
    User(i32),
    Comment(i32),
}

// pub struct UserPermission {
//     pub permission: Permission,
//     pub user: User,
// }

type UserSet = HashSet<UserID>;

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct UserSetEntry(u64, Option<UserSet>);

#[derive(Debug, Clone)]
pub enum UserPermission {
    ViewPost(UserSet),
    ChangePost(UserSet),
    // etc...
}

// Implemented equality based solely on matching types
impl PartialEq for UserPermission {
    fn eq(&self, other: &UserPermission) -> bool {
        match self {
            UserPermission::ChangePost(_) => match other {
                UserPermission::ChangePost(_) => true,
                _ => false,
            },
            UserPermission::ViewPost(_) => match other {
                UserPermission::ViewPost(_) => true,
                _ => false,
            },

            // TODO: add any more for any other permissions!
            _ => unimplemented!(),
        }
    }
}
impl Eq for UserPermission {}

impl Add for UserPermission {
    type Output = UserPermission;

    fn add(self, other: UserPermission) -> UserPermission {
        match self {
            UserPermission::ChangePost(inner_lhs) => match other {
                UserPermission::ChangePost(inner_rhs) => {
                    let union: HashSet<_> = inner_lhs.union(&inner_rhs).cloned().collect();
                    if inner_lhs == inner_rhs {
                        // return the RHS which is considered the 'newer' version of the same
                        // value/key.
                        return UserPermission::ChangePost(inner_rhs);
                    }
                    UserPermission::ChangePost(union)
                }
                _ => panic!("Cannot add different variants of UserPermission!!"),
            },
            UserPermission::ViewPost(inner_lhs) => match other {
                UserPermission::ViewPost(inner_rhs) => {
                    let union: HashSet<_> = inner_lhs.union(&inner_rhs).cloned().collect();
                    if inner_lhs == inner_rhs {
                        // return the RHS which is considered the 'newer' version of the same
                        // value/key.
                        return UserPermission::ViewPost(inner_rhs);
                    }
                    UserPermission::ViewPost(union)
                }
                _ => panic!("Cannot add different variants of UserPermission!!"),
            },
        }
    }
}

impl AddAssign for UserPermission {
    fn add_assign(&mut self, other: UserPermission) {
        *self = self.clone() + other;
    }
}

#[derive(Debug, Clone)]
pub struct UserID {
    id: i32,
    token: String,
}

impl UserID {
    pub fn new() -> UserID {
        UserID {
            id: 0,
            token: "".to_owned(),
        }
    }
    pub fn create(id: i32, token: String) -> UserID {
        UserID { id, token }
    }
}

impl Hash for UserID {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.id.hash(state);
    }
}

/// equality based solely on the primary key (id).
impl PartialEq for UserID {
    fn eq(&self, other: &UserID) -> bool {
        self.id == other.id
    }
}
impl Eq for UserID {}

impl UserPermission {
    pub fn insert(&mut self, u: UserID) -> bool {
        println!("Inserting User: {:?}", u);
        match self {
            UserPermission::ViewPost(view_post) => view_post.insert(u),
            UserPermission::ChangePost(change_post) => change_post.insert(u),
            _ => unimplemented!(),
        }
    }

    pub fn remove(&mut self, u: &UserID) -> bool {
        match self {
            UserPermission::ViewPost(view_post) => view_post.remove(u),
            UserPermission::ChangePost(change_post) => change_post.remove(u),
            _ => unimplemented!(),
        }
    }

    pub fn get_users(&self) -> HashSet<UserID> {
        match self {
            UserPermission::ViewPost(view_post) => view_post.into_iter().cloned().collect(),
            UserPermission::ChangePost(change_post) => change_post.into_iter().cloned().collect(),
            _ => unimplemented!(),
        }
    }
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

    /// ## Permission:
    ///  the permission information for this resource.
    ///  Can be though of as a Set of Set's (cause it is) in that
    ///  the outer set contains an inner set that is an individual
    ///  permission type (with all the users that have that permission)
    ///  inside of it.
    ///  ### Basic idea:  
    ///        Vec{ ViewPost{User1, User2, User3...}, ChangePost{User2,}, }
    ///
    ///  ### Example:
    ///     let resource = Resource::new();
    ///     resource.permissions.insert(Permission::ViewPost(true),
    ///                                 UserPermission::ViewPost());
    ///
    pub permissions: Vec<UserPermission>,
}

impl Resource {
    pub fn new(inner: Model) -> Resource {
        Resource {
            data: inner,
            watchers: vec![],
            version: 0,
            permissions: vec![],
        }
    }

    /// add_permission: really just merges the permissions object passed in, into the actual values
    pub fn add_permission(&mut self, permission: UserPermission) /* -> Option<Vec<bool>> */
    {
        println!("\n******************************************\n");
        println!("[PERM] Permissions before: {:?}", self.permissions);

        // This is a little confusing, because I have to clone a value due to
        //   - Lifetime
        //   - Borrowing
        //              .... and then use it to determine if a value existed,
        // then actually borrow the value in the loop -> pattern match --> union the sets
        // and finally set it as that new unioned value.
        let temp = self.permissions.clone();
        let existing_value = temp.iter()
            .find(|user_permission| **user_permission == permission);

        match existing_value {
            None => {
                println!("[PERM] pushing permission: {:?}.", permission);
                self.permissions.push(permission);
            }
            Some(_) => {
                for perm in &mut self.permissions {
                    let perm_clone = permission.clone();
                    if *perm == perm_clone {
                        println!("[PERM] Matched {:?}=={:?}", perm, perm_clone);
                        let added = perm.clone() + perm_clone;
                        *perm = added;
                    }
                }
            }
        }
        for perm in &self.permissions {
            println!("[PERM]<DEBUG> perm in &self.permissions --> {:?}", perm);
        }
        println!("[PERM] Permissions after: {:?}", self.permissions);
        println!("\n******************************************\n");
    }

    pub fn add_watch(&mut self, id: i32) {
        self.watchers.push(id)
    }

    /// remove_watch: remove's a watch from the watchers map
    pub fn remove_watch(&mut self, id: i32) {
        // self.watchers.remove_item(&id).unwrap();
        let mut index = -1;
        {
            let temp = self.watchers.iter().find(|x| **x == id);
            if temp.is_some() {
                index = *temp.unwrap();
            } else {
                return;
            }
        }
        self.watchers.remove(index as usize);
    }

    // ? all_watchers: goal is to get a vector of copy'd user's
    // ! deprecated because no longer a trait object and necessary to expose
    // ! fields as methods.
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

#[derive(Clone)]
pub struct Msg {
    pub msg_type: MessageType,
    pub timestamp: i32,
    pub items: Vec<Arc<Resource>>,
    pub errors: Vec<String>,
    pub connection_id: i32,
}

/// Msg uses the common standard library/crate pattern for building objects called
///  the 'builder pattern'. This can be found at: https://abronan.com/rust-trait-objects-box-and-rc/
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
        self.items = actual;
        self
    }

    /// Termination of the builder-pattern to return a fully owned clone of the
    /// built up wrapper.
    pub fn build(&mut self) -> Msg {
        self.clone()
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

#[derive(Associations, Identifiable, Queryable, Insertable, Serialize, Deserialize, Debug, Clone,
         PartialEq, Default)]
#[belongs_to(User)]
#[table_name = "posts_post"]
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

    pub color: String,
    pub layout: Value,
    pub original_user_id: Option<i32>,
}

#[cfg(test)]

mod tests {
    use models;
    use models::*;
    use std;
    use std::any::Any;
    use std::any::TypeId;
    use std::collections::hash_map::{DefaultHasher, RandomState};
    use std::collections::{HashMap, HashSet};
    use std::hash::{BuildHasher, Hasher};

    pub fn typeid<T: Any>(_: &T) -> TypeId {
        TypeId::of::<T>()
    }

    pub struct TestHasher {}

    pub struct TestHash {}

    impl Hasher for TestHash {
        fn finish(&self) -> u64 {
            0
        }
        fn write(&mut self, input: &[u8]) {}
    }

    impl BuildHasher for TestHasher {
        type Hasher = TestHash;
        fn build_hasher(&self) -> <Self as std::hash::BuildHasher>::Hasher {
            TestHash {}
        }
    }

    #[test]
    fn test_posts_by_user() {

        // Post::belonging_to()
    }

    #[test]
    fn test_response_msg() {
        let p: Post = Default::default();
        let payload = vec![Model::Post(p)];
        let versions = vec![1];
        let a = WSMessageResponse::new(&payload, &versions);
        let new_post: Post = Default::default();
        let t = &Model::Post(new_post);
        let b = WSMsgResponse(1, t);
    }

    #[test]
    fn test_hashset_stuff() {
        let mut hs: HashSet<User> = HashSet::new();
        hs.insert(User::new());
        let mut resource = Resource::new(Model::Post(Post::new()));
        let user = UserID::new();
        let mut perm = UserPermission::ViewPost(HashSet::new());
        perm.insert(user);
        resource.add_permission(perm.clone());

        let user2 = UserID::create(1, String::from("aisdmoaismdasdf"));
        let mut perm2 = UserPermission::ViewPost(HashSet::new());
        perm2.insert(user2);
        resource.add_permission(perm2.clone());

        let user3 = UserID::create(3, String::from("mkmdsopaifdj9834kdf"));
        let mut perm3 = UserPermission::ChangePost(HashSet::new());
        perm3.insert(user3);
        resource.add_permission(perm3.clone());

        let user4 = UserID::create(3, String::from("changedtokeninoneword"));
        let mut perm4 = UserPermission::ChangePost(HashSet::new());
        perm4.insert(user4);
        resource.add_permission(perm4.clone());

        let mut perm_add = perm.clone() + perm2.clone();
        let user5 = UserID::create(10, "aso7asdjd56fifk30dfikasdf8^&)hsd".to_owned());
        let mut perm5 = UserPermission::ViewPost(HashSet::new());
        perm5.insert(user5);

        perm_add += perm5.clone();
    }

    // #[test]
    // fn test_enum_model() {
    //     let p = Post::new();
    //     let post = F::Post(p);
    //     let mut x = vec![];
    //     x.push(post);
    //     x.push(F::User(User::new()));
    //     x.push(F::Comment(Comment::new()));

    //     let mut hm: HashMap<ID, F> = HashMap::new();
    //     hm.insert(ID::Post(1), F::Post(Post::new()));
    //     hm.insert(ID::Comment(2), F::Comment(Comment::new()));
    //     hm.insert(ID::User(2), F::User(User::new()));
    //     hm.insert(ID::Post(2), F::Post(Post::new()));

    //     println!("HM: {:?}", hm[&ID::Post(1)]);

    //     println!("Typed HASHMAP: {:?}", hm);
    //     for (a, b) in &hm {
    //         println!(" Entry ---> {:?}: {:?}", a, b);
    //         match a {
    //             ID::Post(id) => println!("{:?}", id),
    //             ID::Comment(id) => println!("{:?}", id),
    //             _ => println!("Other..."),
    //         }
    //     }

    //     println!("X --------------> {:?}", x);
    //     for y in &mut x {
    //         println!("Y: {:?}", y);
    //         match y {
    //             F::Post(ref mut p) => {
    //                 println!("This is a post with id: {:?}", p.id);
    //                 println!("Post Content: {:?}", p.content);
    //                 p.id = 1;
    //                 println!("This is a post with id: {:?}", p.id);
    //             }
    //             F::User(u) => println!("This is a user: {:?}", u),
    //             F::Comment(c) => println!("This is a comment: {:?}", c),
    //             _ => println!("This is everything else..."),
    //         }
    //     }
    // }

    // a few of the tests below are pointless, keep that in mind
    // #[test]
    // fn test_post() {
    //     let p = models::Post::new();
    //     assert_eq!(models::Post::new(), p)
    // }

    // #[test]
    // fn test_new_model() {
    //     let m = models::Resource::new(models::Post::new());
    //     let typ = typeid(&m);
    //     assert_eq!(
    //         std::any::TypeId::of::<models::Resource<models::Post>>(),
    //         typ
    //     );
    // }

    // #[test]
    // fn test_resource_init() {
    //     let p = models::Post::new();
    //     let m = &mut models::Resource::<models::Post>::new(p);
    // }
    // #[test]
    // fn test_resource_add_watch() {
    //     let p = models::Post::new();
    //     let m = &mut models::Resource::<models::Post>::new(p);

    //     m.add_watch(1);
    //     m.add_watch(2);
    //     {
    //         let all = m.all_watchers();
    //         assert_eq!(*all, vec![1, 2]);
    //         // let t = m.data;
    //     }
    // }
    // #[test]
    // fn test_resource_remove_watch() {
    //     let p = models::Post::new();
    //     let m = &mut models::Resource::<models::Post>::new(p);

    //     m.add_watch(1);
    //     m.add_watch(2);
    //     {
    //         let all = m.all_watchers();
    //         assert_eq!(*all, vec![1, 2]);
    //         // let t = m.data;
    //     }
    //     m.remove_watch(1);
    //     assert_eq!(m.watchers, vec![2]);

    //     // m.increment();
    //     // assert_eq!(m.version, 1);
    // }
}
