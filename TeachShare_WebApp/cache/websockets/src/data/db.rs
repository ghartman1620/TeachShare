use Post;
use User;


//use diesel::prelude::*;
//use diesel::sql_query;


fn get_post(pk: i32) -> Post {
    Post {pk: 0, comments: Vec::new(), user: User{pk: 0}}
}


#[cfg(test)]
mod tests {
    use super::*;
    use User;
    use Post;
    #[test]
    fn hello_db() {

        //let conn: PgConnection = PgConnection::establish("host=localhost port=5432 dbname=teachshare connect_timeout=10").unwrap();
        assert_eq!(get_post(0), Post {pk: 0, comments: Vec::new(), user: User{pk: 0}});
    }
}