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

impl Refresh for DjangContentType {
    type Model = DjangContentType;
    fn refresh(&mut self) -> Option<&Self::Model> {
        let db = DB::new();
        match DjangContentType::get_by_id(self.id, &db) {
            Ok(val) => {
                *self = val;
            }
            Err(db_err) => {
                error!("Error: {:?}", db_err);
            }
        }
        Some(self)
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
    pub fn get_by_id(key: i32, db: &DB) -> Result<DjangContentType, DBError> {
        use schema::django_content_type::dsl::{django_content_type};
        let conn = db.get();
        let content_type: DjangContentType = django_content_type.find(key).first(&*conn)?;
        debug!("Content type: {:?}", content_type);
        Ok(content_type)
        // match content_type {
        //     Ok(ct) => Ok(ct),
        //     Err(err) => Err(DBError::NotFound),
        // }
    }

    pub fn get_all(db: &DB) -> Result<Vec<DjangContentType>, DBError> {
        use schema::django_content_type::dsl::{app_label, django_content_type, id, model};
        let conn = db.get();
        let content_types = django_content_type
            .select((id, model, app_label))
            .load(&*conn)?;
        debug!("Post content type: {:?}", content_types);
        Ok(content_types)
    }
    pub fn get_dct_by_model<'a>(db: &DB, model_name: &'a str) -> Result<DjangContentType, DBError> {
        use schema::django_content_type::dsl::{django_content_type, model};
        let conn = db.get();
        let mut content_type: Vec<DjangContentType> = django_content_type
            .filter(model.eq(model_name.to_owned()))
            .load::<DjangContentType>(&*conn)?;
        if content_type.len() == 1 {
            Ok(content_type
                .pop()
                .expect("Unwrap pop'd value. Shouldn't be possible to fail!"))
        } else {
            Err(DBError::MoreThanOne) // cause really, what's the difference!?
        }
    }
}

impl Refresh for UserObjectPermission {
    type Model = UserObjectPermission;
    fn refresh(&mut self) -> Option<&Self::Model> {
        let db = DB::new();
        match UserObjectPermission::get_by_id(self.id, self.content_type_id, &db) {
            Ok(val) => {
                *self = val;
            }
            Err(db_err) => {
                error!("Error: {:?}", db_err);
            }
        }
        Some(self)
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

trait Refresh {
    type Model;
    fn refresh(&mut self) -> Option<&Self::Model>;
}

impl Refresh for Post {
    type Model = Post;

    fn refresh(&mut self) -> Option<&Self::Model> {
        let db = DB::new();
        let session = db.get();
        match Post::get(self.id, &*session) {
            Ok(ref mut val) => {
                if let Some(s) = val.pop() {
                    *self = s;
                }
            }
            Err(db_err) => {
                error!("Error: {:?}", db_err);
            }
        }
        Some(self)
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

#[cfg(test)]
mod tests {
    use db::*;
    use models::*;

    #[test]
    fn test_django_ctt_refresh() {
        let db = DB::new();
        let mut example: DjangContentType = DjangContentType::get_by_id(1, &db).unwrap();
        let DjangContentType{id, app_label, model} = example.clone();
        println!("original: {:?}", example);
        example.model = "this isn't a model name but OK!".to_owned();
        println!("changed: {:?}", example);
        example.refresh();
        println!("after refresh: {:?}", example);
        assert_eq!(id, example.id);
        assert_eq!(app_label, example.app_label);
        assert_eq!(model, example.model);
    }

    #[test]
    fn test_django_ctt_get_by_id() {
        let db = DB::new();
        let example = DjangContentType::get_by_id(1, &db);
        println!("EXAMPLE: {:?}", example);
        assert!(example.is_ok());
        let extracted = example.unwrap(); // don't care if we panic on test...
        assert_eq!(1, extracted.id);
    }

    #[test]
    fn test_refresh_userobjectperm() {
        let db = DB::new();
        let mut uop: UserObjectPermission = UserObjectPermission::get_all(&db).unwrap()[0].clone();
        let temp1 = uop.clone();
        uop.object_pk = String::from("uhoh");
        uop.refresh();
        assert_eq!(temp1, uop); // that it's refreshing to the db version
    }

    #[test]
    fn test_post_refresh_trait() {
        let db = DB::new();
        let session = db.get();
        let p = Post::get(5, &*session);
        let temp_p = p.unwrap();
        if temp_p.len() > 0 {
            let mut p1 = temp_p[0].clone();
            p1.title = String::from("this is a different title now!");
            p1.refresh();
        }
    }

    #[test]
    fn test_django_content_type() {
        let db = DB::new();
        let test_q = DjangContentType::get_all(&db);
        let test2 = DjangContentType::get_dct_by_model(&db, "post");
    }

    #[test]
    fn test_guardian_userobjectpermission() {
        let db = DB::new();
        let test = UserObjectPermission::get_all(&db);
        UserObjectPermission::get_by_id(1, 23, &db);
        let test2 = UserObjectPermission::get_cache_line_for(1, 23, &db);
    }

    #[test]
    fn test_association() {
        let db = DB::new();
        let session = db.get();
        let post = Post::get(1, &session).unwrap();
        let ct = DjangContentType::get_dct_by_model(&db, "post").unwrap();
        let result: Result<UserObjectPermission, _> =
            UserObjectPermission::belonging_to(&ct).first(&*session);
    }
}
