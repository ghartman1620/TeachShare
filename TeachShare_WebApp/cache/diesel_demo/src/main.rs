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
use diesel::result::Error;
use dotenv::dotenv;
use std::env;
use std::rc::*;

pub fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

fn main() {
    /*
    use schema::posts_post::dsl::*;

    
    
    let mut result = posts_post
        .limit(1)
        .load::<Post>(&connection)
        .expect("Error loading post");
    println!("{}", result[0].title);

    let updated_row: Result<Post, Error> = diesel::update(posts_post.filter(title.eq(result[0].title.clone())))
        .set(title.eq("FooBarabc123"))
        .get_result(&connection);

    println!("Success!: {}", updated_row.unwrap().title);

    let mut results = posts_post
        .limit(3)
        .load::<Post>(&connection)
        .expect("Error loading posts");

    println!("Displaying {} post", results.len());

    let mut i: i32 = 0;
    for post in results.iter_mut(){
        println!("Post {} before-change: {}", i, post.title.clone());
        post.title=String::from("Post") + &i.to_string();
        post.save(&connection);
        i+=1;
        println!("Post {} after-change: {}", i, post.title.clone());
        
    }
        
    //let post: Rc<Post> = Rc<Post>::new(results[0]);

    // let post: Post = results.pop().expect("empty vec");

    */

    let connection = establish_connection();
    let mut p: Post = Post::get(1, &connection).expect("No post 1");
    println!("Hi post {}", p.title);
    p.title = String::from("I've got a new title now!");
    p.save(&connection);
    
}


