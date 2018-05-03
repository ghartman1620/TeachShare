#[macro_use]
extern crate diesel;
extern crate dotenv;
extern crate serde_json;

pub mod models;
pub mod schema;

use models::*;

use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::query_builder::functions::sql_query;
use diesel::sql_types::*;
use dotenv::dotenv;
use std::env;

pub fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

fn main() {
    use schema::posts_post::dsl::*;

    let connection = establish_connection();
    let results = posts_post
        .limit(5)
        .load::<Post>(&connection)
        .expect("Error loading posts");

    println!("Displaying {} post", results.len());
    for post in results {
        println!("Hello {}", post.title);
    }
}
