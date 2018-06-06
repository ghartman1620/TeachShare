use crossbeam_channel::Receiver;
use diesel::associations::{BelongsTo, GroupedBy, HasTable, Identifiable};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::{result, update};
use dotenv::dotenv;

use models::Post;
use schema::django_content_type;
use schema::guardian_userobjectpermission;
use schema::posts_post;
use users::User;

use serde_json::value::Value;
use std::env;
use std::error::Error as StdError;
use std::fmt;
use std::rc::Rc;

pub fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

#[allow(dead_code)]
#[derive(Clone)]
pub struct DB {
    _conn: Rc<PgConnection>,
}

#[allow(dead_code)]
impl DB {
    pub fn new() -> DB {
        DB {
            _conn: Rc::new(establish_connection()),
        }
    }
    pub fn get(&self) -> Rc<PgConnection> {
        self._conn.clone()
    }
    pub fn get_mut(&mut self) -> Option<&mut PgConnection> {
        Rc::get_mut(&mut self._conn)
    }
}

#[derive(Debug)]
pub enum DBError {
    IncorrectLogic,
    MoreThanOne,
    NotFound,
    OtherDatabase,
}

impl fmt::Display for DBError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            DBError::NotFound => f.write_str("NotFound"),
            DBError::MoreThanOne => f.write_str("MoreThanOne"),
            DBError::IncorrectLogic => f.write_str("UnrelatedErr"),
            DBError::OtherDatabase => f.write_str("OtherDieselErr"),
        }
    }
}

impl StdError for DBError {
    fn description(&self) -> &str {
        match *self {
            DBError::NotFound => "Record not found",
            DBError::MoreThanOne => "More than one entry was returned, when that should have not been possible.",
            DBError::IncorrectLogic => "Something unrelated to the actual query went wrong. Denotes something that should not happen.",
            DBError::OtherDatabase => "There was another diesel error."
        }
    }
}

impl From<diesel::result::Error> for DBError {
    fn from(e: diesel::result::Error) -> Self {
        match e {
            diesel::result::Error::NotFound => DBError::NotFound,
            _ => DBError::OtherDatabase,
        }
    }
}

#[derive(Identifiable, Queryable, Insertable, Serialize, Deserialize, Debug, Clone, PartialEq,
         Default)]
#[table_name = "django_content_type"]
pub struct DjangContentType {
    id: i32,
    app_label: String, // make these str refs so that it's faster to write a query
    model: String,     // as well as the fact that we won't use this struct for much
} // but the id....

/// ### DjangoContentType:
/// used for mapping the content_type_id to the correct model (for auth-->permissions).
///
impl DjangContentType {
    pub fn new() -> Self {
        let result: DjangContentType = Default::default();
        result
    }
    pub fn get_all(db: &DB) -> Result<Vec<DjangContentType>, DBError> {
        use schema::django_content_type::dsl::{app_label, django_content_type, id, model};
        let conn = db.get();
        let content_types = django_content_type
            .select((id, model, app_label))
            .load(&*conn)?;
        info!("Post content type: {:?}", content_types);
        Ok(content_types)
    }
    pub fn get_dct_by_model<'a>(db: &DB, model_name: &'a str) -> Result<DjangContentType, DBError> {
        use schema::django_content_type::dsl::{django_content_type, model};
        let conn = db.get();
        let content_type: Vec<DjangContentType> = django_content_type
            .filter(model.eq(model_name.to_owned()))
            .load::<DjangContentType>(&*conn)?;
        if content_type.len() == 1 {
            Ok(content_type[0].clone())
        } else {
            Err(DBError::MoreThanOne) // cause really, what's the difference!?
        }
    }
}

#[derive(Associations, Identifiable, Queryable, Insertable, Serialize, Deserialize, Debug, Clone,
         PartialEq, Default)]
#[belongs_to(Post, foreign_key = "object_pk")]
#[belongs_to(DjangContentType, foreign_key = "content_type_id")]
#[table_name = "guardian_userobjectpermission"]
pub struct UserObjectPermission {
    pub id: i32,
    pub object_pk: String,
    pub content_type_id: i32,
    pub user_id: i32,
    pub permission_id: i32,
}

impl UserObjectPermission {
    pub fn new() -> UserObjectPermission {
        Default::default()
    }

    pub fn get_all(db: &DB) -> Result<Vec<UserObjectPermission>, DBError> {
        use schema::guardian_userobjectpermission::dsl::guardian_userobjectpermission;

        let session = db.get();
        let response = guardian_userobjectpermission.load(&*session)?;
        debug!("UserObjectPermission => {:?}", response);
        Ok(response)
    }

    fn get_by_id(obj_id: i32, content_type: i32, db: &DB) -> Result<UserObjectPermission, DBError> {
        use schema::guardian_userobjectpermission::dsl::{
            content_type_id, guardian_userobjectpermission, object_pk,
        };

        let id_str = obj_id.to_string();
        let session = db.get();
        let response = guardian_userobjectpermission
            .filter(object_pk.eq(id_str))
            .filter(content_type_id.eq(content_type))
            .first(&*session)?;
        debug!("UserObjectPermission => {:?}", response);
        Ok(response)
    }

    // Grabs permission entires for objects in each direction, effectively a 'cache-line'. Minimizes
    // requests, by hopefully getting a number chunk_starting_atof the subsequent objects permissions..
    fn get_cache_line_for(
        obj_id: i32,
        content_type: i32,
        db: &DB,
    ) -> Result<Vec<UserObjectPermission>, DBError> {
        use schema::guardian_userobjectpermission::dsl::{
            content_type_id, guardian_userobjectpermission, object_pk,
        };
        let session = db.get();
        let objects = vec![obj_id - 1, obj_id, obj_id + 1];
        let query_ids: Vec<String> = objects.into_iter().map(|x| x.to_string()).collect();
        let response: Vec<UserObjectPermission> = guardian_userobjectpermission
            .filter(object_pk.eq_any(query_ids))
            .load(&*session)?;
        Ok(response)
    }
}

trait GetByID<T, U>
where
    U: Sized,
{
    fn get_by_id(&self, id: T, db: &DB) -> Result<Vec<U>, DBError>;
}

impl GetByID<i32, UserObjectPermission> for UserObjectPermission {
    fn get_by_id(&self, obj_id: i32, db: &DB) -> Result<Vec<UserObjectPermission>, DBError> {
        use schema::guardian_userobjectpermission::dsl::{
            guardian_userobjectpermission, object_pk,
        };

        let session = db.get();
        let response = guardian_userobjectpermission
            .filter(object_pk.eq(obj_id.to_string()))
            .load::<UserObjectPermission>(&*session)?;
        info!("UserObjectPermission => {:?}", response);
        Ok(response)
    }
}

impl Post {
    pub fn new() -> Post {
        Post {
            id: 0,
            title: String::from(""),
            content: Value::Null,
            // updated: PgTimestamp(0),
            likes: 0,
            // timestamp: PgTimestamp(0),
            tags: Value::Array(vec![]),
            user_id: 0,
            draft: false,
            content_type: 0,
            grade: 0,
            // length: PgInterval::new(0, 0, 0),
            subject: 0,
            crosscutting_concepts: vec![],
            disciplinary_core_ideas: vec![],
            practices: vec![],

            color: String::from("#96e6b3"),
            layout: Value::Array(vec![]),
            original_user_id: None,
        }
    }
    pub fn get_all(ids: Vec<i32>, conn: &PgConnection) -> Result<Vec<Post>, result::Error> {
        use schema::posts_post::dsl::*;
        posts_post.filter(id.eq_any(ids)).load::<Post>(conn)
    }

    pub fn get(pk_id: i32, conn: &PgConnection) -> Result<Vec<Post>, result::Error> {
        use schema::posts_post::dsl::*;
        posts_post.filter(id.eq(pk_id)).load::<Post>(conn)
    }

    pub fn save(&self, conn: &PgConnection) -> Result<(), String> {
        use schema::posts_post::dsl::*;

        let updated_row: Result<Post, result::Error> = update(posts_post.filter(id.eq(self.id)))
            .set((
                title.eq(self.title.clone()),
                content.eq(self.content.clone()),
                likes.eq(self.likes),
                tags.eq(self.tags.clone()),
                user_id.eq(self.user_id),
                draft.eq(self.draft),
                content_type.eq(self.content_type),
                grade.eq(self.grade),
                subject.eq(self.subject),
                crosscutting_concepts.eq(self.crosscutting_concepts.clone()),
                disciplinary_core_ideas.eq(self.disciplinary_core_ideas.clone()),
                color.eq(self.color.clone()),
                layout.eq(self.layout.clone()),
                original_user_id.eq(self.original_user_id),
                practices.eq(self.practices.clone()),
            ))
            .get_result(conn);

        if updated_row.is_err() {
            let actual_error = updated_row.unwrap_err();
            error!("[DB]<ERROR> {:?}", actual_error);
            Err(String::from(
                "There was an issue with the supplied database connection.",
            ))
        } else {
            info!("[DB] ** Saved post successfully! **");
            Ok(())
        }
    }
}
// pub fn save_posts(rx: Receiver<Post>) {
//     let db = DB::new();

//     loop {
//         use std::time::SystemTime;
//         let res = rx.recv();
//         if res.is_err() {
//             println!("Sender hung up, exiting");
//             break;
//         } else {
//             let p: Post = res.unwrap();
//             // let res = db.insert_post(p);
//             let res = p.save(&*db.get());
//             // res.expect("error saving post");
//             match res {
//                 Ok(_) => println!("Saving post in DB response was successful!"),
//                 Err(e) => println!("[DB]<ERROR> Saving post error. '{:?}'", e),
//             }
//         }
//     }
// }

#[cfg(test)]
mod tests {
    use crossbeam_channel::*;
    use db::*;
    use diesel::prelude::*;
    use diesel::result;
    use models::*;
    use schema::{auth_permission, guardian_userobjectpermission, posts_post};

    use std::sync::mpsc::channel;
    use std::thread;
    use std::time::SystemTime;

    use users::{AuthPermission, Oauth2ProviderAccesstoken, User};

    #[test]
    fn test_django_content_type() {
        let db = DB::new();
        let test_q = DjangContentType::get_all(&db);
        println!("TEST_Q -------> {:?}", test_q);

        let test2 = DjangContentType::get_dct_by_model(&db, "post");
        println!("DCT --------------------> {:?}", test2);

        // let dct = test2.unwrap();
        // let auth_perm = AuthPermission::belongs_to(&dct);

        // // let auth_p = AuthPermission::get_by_codename("view_post".to_owned(), &db).unwrap();
        // // let test3 = DjangContentType::belongs_to(&auth_p);
        // println!("DCT for AUTHP -----> {:?}", auth_perm);
    }

    #[test]
    fn test_guardian_userobjectpermission() {
        let db = DB::new();
        let test = UserObjectPermission::get_all(&db);
        UserObjectPermission::get_by_id(1, 23, &db);
        println!("UserObjectPermission: {:?}", test);

        let test2 = UserObjectPermission::get_cache_line_for(1, 23, &db);
        println!("$$$ TEST2 $$$  ----------> {:?}", test2);
    }

    #[test]
    fn test_association() {
        let db = DB::new();
        let session = db.get();
        let post = Post::get(1, &session).unwrap();
        let ct = DjangContentType::get_dct_by_model(&db, "post").unwrap();
        let result: Result<UserObjectPermission, _> =
            UserObjectPermission::belonging_to(&ct).first(&*session);
        println!("\n************************************\n{:?}\n", result);
    }

    //pre: Post with pk -1 exists
    //tests that changing a post's title and calling its .save() method
    //has the change saved in the database to be yielded in future get()s
    // #[test]
    // fn test_change_post() {
    //     let conn: PgConnection = establish_connection();
    //     let res: Result<Vec<Post>, result::Error> = Post::get(-1, &conn);
    //     if res.is_err() {
    //         println!(
    //             "test_change_post will fail: no post -1 exists (create it to have this test work!"
    //         );
    //         assert!(res.is_ok()); //this fails
    //     }
    //     let mut posts: Vec<Post> = res.unwrap();
    //     let mut p = &mut posts[0];
    //     println!("{}", p.title);
    //     //save the current title so we can put it back when test is done
    //     let s: String = p.title.clone();
    //     p.title = String::from("changed");
    //     p.save(&conn);

    //     let res1: Result<Vec<Post>, result::Error> = Post::get(-1, &conn);
    //     assert!(res1.is_ok());
    //     let mut posts: Vec<Post> = res1.unwrap();
    //     let p = &mut posts[0];
    //     println!("{}", p.title);
    //     assert_eq!(p.title, String::from("changed"));
    //     p.title = s.clone();
    //     p.save(&conn);
    // }
    // //pre: Post with pk -5 does not exist
    // #[test]
    // fn test_post_dne_error() {
    //     let conn: PgConnection = establish_connection();
    //     let res = Post::get(-5, &conn);
    //     assert!(res.is_err());
    // }

    // #[test]
    // fn test_save_posts_thread() {
    //     let connection = establish_connection();

    //     let (tx, rx) = unbounded();
    //     let begin = SystemTime::now();

    //     let t = thread::spawn(move || {
    //         save_posts(rx);
    //     });
    //     let mut posts = Post::get(1, &connection).expect("no post 1");
    //     //we'll set p's title back to whatever it was once we're done

    //     let p = &mut posts[0];
    //     let s = p.title.clone();
    //     let _ = tx.send(p.clone());
    //     for x in 0..2 {
    //         p.title = format!("change{}", x);
    //         tx.send(p.clone()).expect("Error sending post");
    //     }
    //     println!("i can continue doing useful work while posts are being saved!");
    //     p.title = s;
    //     tx.send(p.clone()).expect("Error sending post");
    //     drop(tx);
    //     let delta = SystemTime::now()
    //         .duration_since(begin)
    //         .expect("time went backwards");
    //     println!("Finished sending posts in time of {:?}", delta);
    //     let _ = t.join();
    //     let delta = SystemTime::now()
    //         .duration_since(begin)
    //         .expect("time went backwards");
    //     println!("Finished saving posts in time of {:?}", delta);
    // }
}
