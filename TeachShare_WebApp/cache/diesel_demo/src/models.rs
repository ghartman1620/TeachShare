use diesel::pg::data_types::PgTimestamp;
use diesel::prelude::*;
use diesel::sql_types::*;

use diesel::pg::data_types::PgInterval;
use serde_json::value::Value;

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

#[derive(Queryable)]
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
    pub subject_id: Option<i32>,
}
