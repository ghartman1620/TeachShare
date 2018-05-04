use diesel::pg::data_types::PgTimestamp;
use diesel::prelude::*;
use diesel::sql_types::*;
use diesel::result::Error;
use diesel::pg::data_types::PgInterval;
use diesel::query_builder::UpdateStatement;
use diesel::update;
use serde_json::value::Value;
use schema::posts_post::dsl::*;


#[derive(Queryable)]
pub struct User {
    id: i32,
    password: String,
    last_login: Option<PgTimestamp>,
    is_superuser: bool,
    pub username: String,
    first_name: String,
    last_name: String,
    email: String,
    is_staff: bool,
    is_active: bool,
    date_joined: PgTimestamp,
}

#[derive(Queryable)]
pub struct Comment {
    pub id: i32,
    pub text: String,
    timestamp: PgTimestamp,
    post_id: i32,
    user_id: i32,
}

#[derive(Queryable, Clone)]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub content: Value,
    pub updated: PgTimestamp,
    pub likes: i32,
    pub timestamp: PgTimestamp,
    pub tags: Value,
    pub user_id: i32,
    pub draft: bool,
    pub content_type: i32,
    pub grade: i32,
    pub length: PgInterval,
    pub subject: i32,
    pub crosscutting_concepts: Vec<i32>,
    pub disciplinary_core_ideas: Vec<i32>,
    pub practices: Vec<i32>,
}

impl Post{
    //where should connection live? maybe in a singleton class in models?
    pub fn get(pk_id: i32, conn: &PgConnection) -> Result<Post, String> {

        // I'm not sure about this plan to just return the first thing in the vec given by expect.
        // Does diesel have some way to expecft a single post from a filter?
        // 
        let res: Result<Vec<Post>, Error> = posts_post
            .filter(id.eq(pk_id))
            .load::<Post>(conn);
        if res.is_ok() {
            let mut vec: Vec<Post> = res.unwrap();
            if vec.len() != 1 {
                return Err(format!("More than one post found for id {}", pk_id));
            }
            return Ok(vec.pop().unwrap());
        }
        else{
            return Err(format!("Post {} not found", pk_id));
        }
    }
    pub fn save(&mut self, conn: &PgConnection){
        println!("Saving post {} {}", self.title, self.id);
        let updated_row:  Result<Post, Error> = update(posts_post.filter(id.eq(self.id)))
            //copy trait is not defined for String, because it's immutable. So we must clone our strings.
            .set((title.eq(self.title.clone()),
                 content.eq(self.content.clone()),
                 updated.eq(self.updated),
                 likes.eq(self.likes),
                 timestamp.eq(self.timestamp),
                 tags.eq(self.tags.clone()),
                 user_id.eq(self.user_id),
                 draft.eq(self.draft),
                 content_type.eq(self.content_type),
                 grade.eq(self.grade),
                 length.eq(self.length),
                 subject.eq(self.subject),
                 //Hopefully these vectors aren't very long... 
                 crosscutting_concepts.eq(self.crosscutting_concepts.clone()),
                 disciplinary_core_ideas.eq(self.disciplinary_core_ideas.clone()),
                 practices.eq(self.practices.clone())))
            .get_result(conn);
        assert_eq!(true, updated_row.is_ok());
    }

}