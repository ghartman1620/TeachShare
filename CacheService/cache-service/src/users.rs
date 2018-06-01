use time;

use diesel::Queryable;

use chrono::{DateTime, Local, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use std::collections::{BTreeMap, BTreeSet};
use time::Duration;
use schema::{auth_user, oauth2_provider_accesstoken};

use db::{DB, DBError};

// user access tokens cache:
// need: user_id, token, expires?
#[derive(Associations, Identifiable, Queryable, Debug, Serialize, Deserialize, Clone, Hash, Eq,
         PartialEq)]
#[belongs_to(User)]
#[table_name = "oauth2_provider_accesstoken"]
pub struct Oauth2ProviderAccesstoken {
    pub id: i64,
    pub token: String,
    pub expires: chrono::DateTime<chrono::Utc>,
    pub scope: String,
    pub application_id: Option<i64>,
    pub user_id: Option<i32>,
    pub created: chrono::DateTime<chrono::Utc>,
    pub updated: chrono::DateTime<chrono::Utc>,
}

/// Oauth2ProviderAccessToken is used to match users --> tokens --> users, you get it.
impl Oauth2ProviderAccesstoken {
    pub fn get_by_token(
        user_token: String,
        conn: &PgConnection,
    ) -> Result<Vec<Oauth2ProviderAccesstoken>, diesel::result::Error> {
        use schema::oauth2_provider_accesstoken::dsl::{oauth2_provider_accesstoken, token};

        oauth2_provider_accesstoken
            .filter(token.eq(user_token))
            .load::<Oauth2ProviderAccesstoken>(conn)
    }
    pub fn get_all(
        conn: &PgConnection,
    ) -> Result<Vec<Oauth2ProviderAccesstoken>, diesel::result::Error> {
        use schema::oauth2_provider_accesstoken::dsl::{oauth2_provider_accesstoken, expires};

        oauth2_provider_accesstoken
            .filter(expires.gt(Utc::now()))
            .load::<Oauth2ProviderAccesstoken>(conn)
    }
    pub fn build_user_table_cached(
        conn: &PgConnection,
    ) -> Option<BTreeMap<i32, Oauth2ProviderAccesstoken>> {
        let all = Oauth2ProviderAccesstoken::get_all(conn);
        let mut user_table: BTreeMap<i32, Oauth2ProviderAccesstoken> = BTreeMap::new();

        match all {
            Ok(auth_users) => {
                for a in &auth_users {
                    println!("AUTH_USER: {:?}", a);
                    match a.user_id {
                        Some(userid) => match user_table.insert(userid, a.clone()) {
                            Some(previous) => {
                                println!("Replaced: {:?} in user auth table.", previous)
                            }
                            None => println!(
                                "Inserted Successfully!, EXPIRES: {:?}, NOW: {:?}",
                                a.expires,
                                Utc::now()
                            ),
                        },
                        None => {
                            println!("There was no user id!");
                        }
                    }
                }
                Some(user_table)
            }
            Err(e) => None,
        }
    }
}

#[derive(Associations, Identifiable, Queryable, Debug, Serialize, Deserialize, Clone, Hash, Eq,
         PartialEq)]
#[table_name = "auth_user"]
pub struct User {
    pub id: i32,
    password: String,
    pub last_login: Option<chrono::DateTime<chrono::Utc>>,
    pub is_superuser: bool,
    pub username: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub is_staff: bool,
    pub is_active: bool,
    pub date_joined: chrono::DateTime<chrono::Utc>,
}

impl User {
    pub fn new() -> User {
        User {
            id: 0,
            password: String::from(""),
            last_login: Some(chrono::Utc::now()),
            is_superuser: false,
            username: String::from(""),
            first_name: String::from(""),
            last_name: String::from(""),
            email: String::from(""),
            is_staff: false,
            is_active: false,
            date_joined: chrono::Utc::now(),
        }
    }

    pub fn get_by_id(user_id: i32, db: &DB) -> Result<User, DBError> {
        use schema::auth_user::dsl::{auth_user, id};

        let session = db.get();
        let user = auth_user.filter(id.eq(user_id)).first(&*session)?;
        Ok(user)
    }
}

#[cfg(test)]

mod tests {
    use db::DB;
    use models;
    use models::*;
    use std::collections::HashMap;
    use users::*;

    #[test]
    fn test_user_access_token_db() {
        let db = DB::new();
        let session = db.get();
        let results = Oauth2ProviderAccesstoken::get_by_token(
            String::from("wiAGgM3GQoAgMnqydoatfSITZElgzI"),
            &session,
        );
        println!("RESULT: {:?}", results);

        let table_cache = Oauth2ProviderAccesstoken::build_user_table_cached(&session);
        println!("OAuth User Table: {:?}", table_cache);
    }

    #[test]
    fn test_get_user_db() {
        let db = DB::new();
        let user = User::get_by_id(1, &db);
        println!("USER => {:?}", user);
    }

    #[test]
    fn test_user_auth_association() {
        let db = DB::new();
        let conn = db.get();
        // let auth = Oauth2ProviderAccesstoken::get_all(&*conn).unwrap();
        let user = User::get_by_id(3, &db).unwrap();
        let result: Result<Oauth2ProviderAccesstoken, _> = Oauth2ProviderAccesstoken::belonging_to(&user).first(&*conn);
        // let result: Result<User, _> =
        //     User::belonging_to(&auth).first(&*conn);
        // println!("\n************************************\n{:?}\n", auth);
        println!("\n************************************\n{:?}\n", user);
        println!("\n************************************\n{:?}\n", result);
    }

    #[test]
    fn test_get_all_posts_by_user() {
        let db = DB::new();
        let conn = db.get();
        let user = User::get_by_id(3, &db).unwrap();
        let posts: Vec<Post> = Post::belonging_to(&user).load(&*conn).unwrap();
        println!("POSTS [{:?}] ------------------> {:?}", posts.len(), posts);
    }
}
