use time;

use diesel::Queryable;

use chrono::{DateTime, Local, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use schema::{auth_permission, auth_user, django_content_type, oauth2_provider_accesstoken};
use std::collections::{BTreeMap, BTreeSet};
use time::Duration;

use db::{DBError, DjangContentType, UserObjectPermission, DB};
use diesel::dsl::Select;
use GrandSocketStation;

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
        use schema::oauth2_provider_accesstoken::dsl::{expires, oauth2_provider_accesstoken};

        oauth2_provider_accesstoken
            .filter(expires.gt(Utc::now()))
            .load::<Oauth2ProviderAccesstoken>(conn)
    }
    pub fn build_user_table_cached(
        conn: &PgConnection,
    ) -> Option<BTreeMap<String, Oauth2ProviderAccesstoken>> {
        let all = Oauth2ProviderAccesstoken::get_all(conn);
        let mut user_table: BTreeMap<String, Oauth2ProviderAccesstoken> = BTreeMap::new();

        match all {
            Ok(auth_users) => {
                for a in &auth_users {
                    debug!("Auth-User: {:?}", a);
                    match a.user_id {
                        Some(userid) => match user_table.insert(a.token.clone(), a.clone()) {
                            Some(previous) => {
                                debug!("Replaced: {:?} in user auth table.", previous)
                            }
                            None => debug!(
                                "Inserted Successfully!, EXPIRES: {:?}, NOW: {:?}",
                                a.expires,
                                Utc::now()
                            ),
                        },
                        None => {
                            error!("There was no user id!");
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
         PartialEq, Default)]
#[belongs_to(DjangContentType, foreign_key = "content_type_id")]
#[table_name = "auth_permission"]

pub struct AuthPermission {
    pub id: i32,
    pub name: String,         // formatted, capitalized name for this permission
    pub content_type_id: i32, // linked to post model
    pub codename: String,     // name of the permission @INFO: This won't change
}

type UserAndPermission = (
    String,
    Option<String>,
    Option<String>,
    Option<i32>,
    Option<String>,
    Option<String>,
);

impl AuthPermission {
    pub fn new() -> AuthPermission {
        Default::default()
    }

    pub fn get_by_codename(perm_name: String, db: &DB) -> Result<AuthPermission, DBError> {
        use schema::auth_permission::dsl::{auth_permission, codename};
        let conn = db.get();

        let permission: AuthPermission = auth_permission
            .filter(codename.eq(perm_name))
            .first::<AuthPermission>(&*conn)?;
        debug!("Permission Entry: {:?}", permission);
        Ok(permission)
    }

    pub fn get_with_content_type(db: &DB) {
        use schema::auth_permission::dsl::{auth_permission, codename, content_type_id};
        use schema::auth_user::dsl::{auth_user, email, id, username};
        use schema::django_content_type::dsl::{app_label, django_content_type, model};
        use schema::guardian_userobjectpermission::dsl::{
            guardian_userobjectpermission, object_pk, permission_id,
        };
        use schema::oauth2_provider_accesstoken::dsl::{
            expires, oauth2_provider_accesstoken, token,
        };

        let session = db.get();
        let user_and_perm: Vec<UserAndPermission> = guardian_userobjectpermission
            .left_join(auth_user)
            .left_join(auth_permission)
            .left_outer_join(django_content_type)
            .select((
                object_pk,
                codename.nullable(),
                model.nullable(),
                id.nullable(),
                username.nullable(),
                email.nullable(),
            ))
            .load(&*session)
            .unwrap();

        info!("USER_AND_AUTH: {:?}", user_and_perm);

        // let data: Vec<(String, String, String, i32, i32, User)> = auth_permission
        //                 .left_join(django_content_type)
        //                 .inner_join(guardian_userobjectpermission
        //                     .left_join(auth_user)
        //                 )
        //                 .select((codename, model, object_pk, permission_id, (auth_user)))
        //                 .load(&*session)
        //                 .unwrap();

        // for (i, d) in data.iter().enumerate() {
        //     info!("{}.) {:?}", i+1, d);
        // }
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

impl Default for User {
    fn default() -> Self {
        Self::new()
    }
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

    pub fn get_associated(user_id: i32, db: &DB) -> Result<User, DBError> {
        use schema::auth_user::dsl::{auth_user, id};
        use schema::oauth2_provider_accesstoken::dsl::{
            expires, oauth2_provider_accesstoken, token,
        };

        let session = db.get();
        let user: (i32, Option<String>, Option<chrono::DateTime<Utc>>) = auth_user
            .left_join(oauth2_provider_accesstoken)
            .filter(id.eq(user_id))
            .select((id, token.nullable(), expires.nullable()))
            .first(&*session)?;
        let just_user: User = auth_user.filter(id.eq(user_id)).first(&*session)?;

        let dt = GrandSocketStation::duration_valid(user.2.unwrap());
        info!("DURATION_VALID: {:?}", dt);

        let ae = AuthEntry {
            user: just_user.clone(),
            token: user.1,
            expires: user.2,
            valid_for: dt,
        };
        info!("USER + MORE = {:?}", ae);
        let oauth2_data: Vec<Oauth2ProviderAccesstoken> =
            Oauth2ProviderAccesstoken::belonging_to(&just_user).load(&*session)?;
        info!("USER + OAUTH2 = {:?}", oauth2_data);

        let u = User::new();
        Ok(u)
    }
}

#[derive(Debug)]
pub struct AuthEntry {
    user: User,
    token: Option<String>,
    expires: Option<chrono::DateTime<Utc>>,
    valid_for: Option<Duration>,
}

#[cfg(test)]

mod tests {
    use db::DB;
    use db::*;
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
        let table_cache = Oauth2ProviderAccesstoken::build_user_table_cached(&session);
    }

    #[test]
    fn test_get_user_db() {
        let db = DB::new();
        let user = User::get_by_id(1, &db);
    }

    #[test]
    fn test_user_auth_association() {
        let db = DB::new();
        let conn = db.get();
        let user = User::get_by_id(3, &db).unwrap();
        let result: Result<Oauth2ProviderAccesstoken, _> =
            Oauth2ProviderAccesstoken::belonging_to(&user).first(&*conn);
    }

    #[test]
    fn test_get_all_posts_by_user() {
        let db = DB::new();
        let conn = db.get();
        let user = User::get_by_id(3, &db).unwrap();
        let posts: Vec<Post> = Post::belonging_to(&user).load(&*conn).unwrap();
    }

    #[test]
    fn test_auth_permission_etc() {
        let db = DB::new();
        let conn = db.get();

        let result = AuthPermission::get_by_codename("view_post".to_owned(), &db);
        let test2 = DjangContentType::get_dct_by_model(&db, "post");
        let say_what = AuthPermission::get_with_content_type(&db);
        let user_assoc = User::get_associated(4, &db);
    }
}