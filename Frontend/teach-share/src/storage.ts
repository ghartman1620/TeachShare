import {User} from "./user";
declare function require(name:string): any;
const Cookie = require("tiny-cookie");

//"logs in" a user without persist. Sets a cookie
//to have the access_token and User data.
//This is used for remembering login between pages
//and as long as user ddoesn't close the browser. If the browser is closed,
//the info in this function disappears. see persistUser below for what
//happens when user checks "remember me"
function loginUser(user: User): void {
    
}