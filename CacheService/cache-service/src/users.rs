use time;

use diesel::Queryable;

use chrono::{DateTime, Local, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use schema::oauth2_provider_accesstoken::dsl::*;
use std::collections::{BTreeMap, BTreeSet};
use time::Duration;

// user access tokens cache:
// need: user_id, token, expires?
#[derive(Queryable, Debug, Clone, PartialEq)]
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
    pub fn get(
        user_token: String,
        conn: &PgConnection,
    ) -> Result<Vec<Oauth2ProviderAccesstoken>, diesel::result::Error> {
        oauth2_provider_accesstoken
            .filter(token.eq(user_token))
            .load::<Oauth2ProviderAccesstoken>(conn)
    }
    pub fn get_all(
        conn: &PgConnection,
    ) -> Result<Vec<Oauth2ProviderAccesstoken>, diesel::result::Error> {
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
        let results = Oauth2ProviderAccesstoken::get(
            String::from("wiAGgM3GQoAgMnqydoatfSITZElgzI"),
            &session,
        );
        println!("RESULT: {:?}", results);

        let table_cache = Oauth2ProviderAccesstoken::build_user_table_cached(&session);
        println!("OAuth User Table: {:?}", table_cache);
    }

}
