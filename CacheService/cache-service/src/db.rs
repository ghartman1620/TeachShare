use crossbeam_channel::Receiver;
use diesel::pg::data_types::PgInterval;
use diesel::pg::data_types::PgTimestamp;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::result;
use diesel::update;
use dotenv::dotenv;
use models::Post;
use schema::posts_post::dsl::*;
use serde_json::value::Value;
use std::env;
use std::rc::Rc;

pub fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

#[allow(dead_code)]
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
        }
    }
    pub fn get_all(ids: Vec<i32>, conn: &PgConnection) -> Result<Vec<Post>, result::Error> {
        return posts_post.filter(id.eq_any(ids)).load::<Post>(conn);
    }

    //where should connection live? maybe in a singleton class in models?
    pub fn get(pk_id: i32, conn: &PgConnection) -> Result<Vec<Post>, result::Error> {
        // I'm not sure about this plan to just return the first thing in the vec given by expect.
        // Does diesel have some way to expecft a single post from a filter?

        //res is a Result<Vec<Post>, diesel::result::Error>

        return posts_post.filter(id.eq(pk_id)).load::<Post>(conn);
        // if res.is_ok() {
        //     let mut results: Vec<Post> = res.unwrap();

        //     if results.len() == 0 {
        //         return Err(format!("Post {} not found", pk_id));
        //     }
        //     if results.len() > 1 {
        //         return Err(format!(
        //             "More than one post returned for {}.
        //            This is very unexpected and indicates an error in your database
        //            that you have more than one post with a particular primary key.",
        //             pk_id
        //         ));
        //     }
        //     return Ok(results.pop().unwrap());
        // } else {
        //     return Err(res.unwrap_err());
        // }
    }
    pub fn save(&self, conn: &PgConnection) -> Result<(), String> {
        let updated_row: Result<Post, result::Error> = update(posts_post.filter(id.eq(self.id)))
            //copy trait is not defined for String, because it's immutable. So we must clone our strings.
            .set((title.eq(self.title.clone()),
                 content.eq(self.content.clone()),
                //  updated.eq(self.updated),
                 likes.eq(self.likes),
                //  timestamp.eq(self.timestamp),
                 tags.eq(self.tags.clone()),
                 user_id.eq(self.user_id),
                 draft.eq(self.draft),
                 content_type.eq(self.content_type),
                 grade.eq(self.grade),
                //  length.eq(self.length),
                 subject.eq(self.subject),
                 //Hopefully these vectors aren't very long... 
                 crosscutting_concepts.eq(self.crosscutting_concepts.clone()),
                 disciplinary_core_ideas.eq(self.disciplinary_core_ideas.clone()),
                 practices.eq(self.practices.clone())))
            .get_result(conn);

        return if updated_row.is_err() {
            Err(String::from(
                "There was an issue with the supplied database connection.",
            ))
        } else {
            Ok(())
        };
    }
}
pub fn save_posts(rx: Receiver<Post>) {
    let connection = establish_connection();
    loop {
        use std::time::SystemTime;
        let res = rx.recv();
        if res.is_err() {
            println!("Sender hung up, exiting");
            break;
        } else {
            let p: Post = res.unwrap();
            let res = p.save(&connection);
            res.expect("error saving post");
        }
    }
}

#[cfg(test)]
mod tests {
    use crossbeam_channel::*;
    use db::*;
    use diesel::prelude::*;
    use diesel::result;

    use std::sync::mpsc::channel;
    use std::thread;
    use std::time::SystemTime;
    //pre: Post with pk -1 exists
    //tests that changing a post's title and calling its .save() method
    //has the change saved in the database to be yielded in future get()s
    #[test]
    fn test_change_post() {
        let conn: PgConnection = establish_connection();
        let res: Result<Vec<Post>, result::Error> = Post::get(-1, &conn);
        if res.is_err() {
            println!(
                "test_change_post will fail: no post -1 exists (create it to have this test work!"
            );
            assert!(res.is_ok()); //this fails
        }
        let mut posts: Vec<Post> = res.unwrap();
        let mut p = &mut posts[0];
        println!("{}", p.title);
        //save the current title so we can put it back when test is done
        let s: String = p.title.clone();
        p.title = String::from("changed");
        p.save(&conn);

        let res1: Result<Vec<Post>, result::Error> = Post::get(-1, &conn);
        assert!(res1.is_ok());
        let mut posts: Vec<Post> = res1.unwrap();
        let mut p = &mut posts[0];
        println!("{}", p.title);
        assert_eq!(p.title, String::from("changed"));
        p.title = s.clone();
        p.save(&conn);
    }
    //pre: Post with pk -5 does not exist
    #[test]
    fn test_post_dne_error() {
        let conn: PgConnection = establish_connection();
        let res = Post::get(-5, &conn);
        assert!(res.is_err());
    }

    #[test]
    fn test_save_posts_thread() {
        let connection = establish_connection();

        let (tx, rx) = unbounded();
        let begin = SystemTime::now();

        let t = thread::spawn(move || {
            save_posts(rx);
        });
        let mut posts = Post::get(1, &connection).expect("no post 1");
        //we'll set p's title back to whatever it was once we're done

        let p = &mut posts[0];
        let s = p.title.clone();
        let _ = tx.send(p.clone());
        for x in 0..1000 {
            p.title = format!("change{}", x);
            tx.send(p.clone()).expect("Error sending post");
        }
        println!("i can continue doing useful work while posts are being saved!");
        p.title = s;
        tx.send(p.clone()).expect("Error sending post");
        drop(tx);
        let delta = SystemTime::now()
            .duration_since(begin)
            .expect("time went backwards");
        println!("Finished sending posts in time of {:?}", delta);
        let _ = t.join();
        let delta = SystemTime::now()
            .duration_since(begin)
            .expect("time went backwards");
        println!("Finished saving posts in time of {:?}", delta);
    }
}
