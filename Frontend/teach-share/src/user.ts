import api from "./api";
import store from "./store";
import Cookie from "tiny-cookie";
import Vue from "vue";


declare function require(name: string): any;


// In the future when we use user profiles can add their information to users as well.
export default class User {
    public username: string;
    public pk: number;
    public email: string;
    public firstName: string;
    public lastName: string;
    public token: string;
    public expires: Date;

    // No parameter constructor. Attempts to make a user
    // from the data in the cookie.
    // called when user exits the page but not the browser window.
    constructor();
    // Refresh token constructor. Called when user logs in with "remember me"
    // checked or when user returns to page after having been remembered and exiting
    // the browser
    constructor(username: string, pk: number, email: string, firstName: string, lastName: string, token: string,
                expires: Date, refreshToken: string);
    // No refresh token constructor. Called when user logs in without "remember me"
    constructor(username: string, pk: number, email: string, firstName: string, lastName: string, token: string,
                expires: Date, refreshToken?: string);
    constructor(
        username?: string,
        pk?: number,
        email?: string,
        firstName?: string,
        lastName?: string,
        token?: string,
        expires?: Date,
        refreshToken?: string) {

        this.username = username || Cookie.get("username");
        this.pk = pk || Cookie.get("pk");
        this.email = email || Cookie.get("email");
        this.firstName = firstName || Cookie.get("firstName");
        this.lastName = lastName || Cookie.get("lastName");
        this.token = token || Cookie.get("token");
        this.expires = expires || new Date(Cookie.get("expires"));
        this.saveDataInCookie();

        if (refreshToken) {
            window.localStorage.setItem("refreshToken", refreshToken);
            window.localStorage.setItem("username", this.username);
        }
        console.log("ASSIGNING API AUTHORIZATION DEFAULTS TO Bearer " + this.token);
        Object.assign(api.defaults, {headers: {authorization: "Bearer " + this.token}});
    }
    public saveDataInCookie(): void {
        Cookie.set("token", this.token);
        Cookie.set("pk", this.pk);
        Cookie.set("username", this.username);
        Cookie.set("email", this.email);
        Cookie.set("firstName", this.firstName);
        Cookie.set("lastName", this.lastName);
        Cookie.set("expires", this.expires.toDateString());
    }
    public getUsername(): string {
        return this.username;
    }

    public getEmail(): string {
        return this.email;
    }
    public getPk(): number {
        return this.pk;
    }
    public getFirstName(): string {
        return this.firstName;
    }
    public getLastName(): string {
        return this.lastName;
    }

}
