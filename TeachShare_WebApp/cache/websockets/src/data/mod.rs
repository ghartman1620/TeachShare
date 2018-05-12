
use Post;
use User;

fn hello_from_module() {
    println!("hello from module");
}

struct DataGetter{

}
impl DataGetter{
    fn get_post(pk: i32) -> Post{

        return Post {pk: 0, comments: Vec::new(), user: User {pk: 0}};
    }
    fn update_post(pk: i32){
        
        
    }
}


#[cfg(tests)]
mod tests {

}