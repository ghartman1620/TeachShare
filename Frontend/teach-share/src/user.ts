import Vue from "vue";
import store from "./store"
import api from "./api"
declare function require(name:string): any;
var Cookie = require("tiny-cookie");

//In the future when we use user profiles can add their information to users as well.
class User {
    username: string;
    pk: number;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    expires: Date;
    
    //No parameter constructor. Attempts to make a user
    //from the data in the cookie.
    //called when user exits the page but not the browser window.
    constructor();
    //Refresh token constructor. Called when user logs in with "remember me"
    //checked or when user returns to page after having been remembered and exiting
    //the browser
    constructor(username: string, pk: number, email: string, firstName: string, lastName: string, token: string,
                expires: Date, refreshToken: string);
    //No refresh token constructor. Called when user logs in without "remember me"
    constructor(username: string, pk: number, email: string, firstName: string, lastName: string, token: string,
                 expires: Date);
    constructor(username?: string, pk?: number, email?: string, firstName?: string, lastName?: string, token?: string, expires?: Date, refreshToken?: string) {
        this.username = username || Cookie.get("username");
        this.pk = pk || Cookie.get("pk");
        this.email = email || Cookie.get("email");
        this.firstName = firstName || Cookie.get("firstName");
        this.lastName = lastName || Cookie.get("lastName");
        this.token = token || Cookie.get("token");
        this.expires = expires || new Date(Cookie.get("expires"));
        this.saveDataInCookie();
        console.log("in user ctor");
        console.log(refreshToken);

        if(refreshToken){
            console.log("setting localstorage");
            window.localStorage.setItem("refreshToken", refreshToken);
            window.localStorage.setItem("username", this.username);
            
        }
        Object.assign(api.defaults, {headers: {authorization: "Bearer " + this.token}});
    }
    saveDataInCookie(): void {
        Cookie.set("token", this.token);
        Cookie.set("pk", this.pk);
        Cookie.set("username", this.username);
        Cookie.set("email", this.email);
        Cookie.set("firstName", this.firstName);
        Cookie.set("lastName", this.lastName);
        Cookie.set("expires", this.expires.toDateString());
    }
    getUsername(): string {
        return this.username;
    }
    getEmail(): string {
        return this.email;
    }
    getPk(): number {
        return this.pk;
    }
    getFirstName(): string {
        return this.firstName;
    }
    getLastName(): string {
        return this.lastName;
    }

}



//I'm moving these functions out of the store and into here
//because I want to be able to pass more than one parameter to them
//and not have to bundle them up as a dictionary to go to a vuex dispatch.

//This is where functions live to perform the one-time function of logging in. This plugin
//Does not persistently check for logged in user on access to routes that require it - that's
//done in index.ts, which also happens to call these functions when a page is accessed
//as necessary.
const UserPlugin = {
    install: function (Vue: any, options: any) {
        Vue.prototype.$logout = function(): void {
            Cookie.remove("token");
            Cookie.remove("loggedIn");
            Cookie.remove("userId");
            Cookie.remove("username");
            Object.assign(api.defaults, {headers: {}});

            window.localStorage.removeItem("refreshToken");
            window.localStorage.removeItem("username");
            
        };
        Vue.prototype.$isLoggedIn = function(): boolean {
            console.log(store.getters.getLoggedInUser);
            return store.state.user.user !== null;
        };
        Vue.prototype.$login = function(username: string, password: string, persist: boolean): Promise<void>{
            var body = {
                username: username,
                password: password,
                grant_type: "password"
            };
            console.log(body);
            var head = { headers: { "content-type": "application/json" } };
            return new Promise( (resolve, reject) => {
                api.post("get_token/", body, head).then(function(response: any){
                    console.log(response);
                    var user: User = new User(response.data.user.username, 
                            response.data.user.pk, 
                            response.data.user.email,
                            response.data.user.first_name, 
                            response.data.user.last_name, 
                            response.data.body.access_token,
                            new Date(Date.now() + response.data.body.expiresIn*1000),
                            persist ? response.data.body.refresh_token : undefined);
                    store.dispatch("setUser", user);
                    resolve();

                }).catch(function(error){
                    
                    reject(error);
                })
            });
        }
    }
}

export default UserPlugin;
export {User};
