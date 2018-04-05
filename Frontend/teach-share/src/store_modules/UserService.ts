import Vue from "vue";
import api from "../api";
import User from "../user";
import { ActionContext, Store } from "vuex";
import {RootState} from "../models";

// typescript 'require' workaround hack
declare function require(name: string): any;
export interface UserState {
    user?: User;
}

interface UserPostObject{
    username: string;
    password: string;
    email: string;
}
interface LoginCredentials{
    username: string;
    password: string;
    persist: boolean;
}

type UserContext = ActionContext<UserState, RootState>;

var Cookie = require("tiny-cookie");

export const actions = {
    createUser (context: UserContext, user: UserPostObject): Promise<any>  {
        return new Promise((resolve, reject) => {
            api.post("users/", user)
                .then(response => resolve(response))
                .catch(function (error) {
                    reject(error);
                });
        });
    },
    setUser (context: UserContext, user: User): void  {
        context.commit("SET_USER", user);
    },
    // potentially move browser memory accesses to some other module in the future?
    logout (context: UserContext): void  {
        Cookie.remove("token");
        Cookie.remove("loggedIn");
        Cookie.remove("userId");
        Cookie.remove("username");
        Object.assign(api.defaults, {headers: {}});

        window.localStorage.removeItem("refreshToken");
        window.localStorage.removeItem("username");
    },
    login (context: UserContext, credentials: LoginCredentials): Promise<any> {
        var body = {
            username: credentials.username,
            password: credentials.password,
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
                        credentials.persist ? response.data.body.refresh_token : undefined);
                context.commit("SET_USER", user);
                resolve();

            }).catch(function(error){
                reject(error);
            })
        });
    }
}
const mutations = {
    SET_USER: (state: UserState, user: User): void => {
        state.user = user;
    },
}
const state: UserState = {
    user: undefined,
}

const UserService = {
    state: state,
    mutations: mutations,
    actions: actions,
    getters: {
        getLoggedInUser (state: UserState) {
            console.log("in  getLoggedInUser");
            return state.user;
        },
        isLoggedIn (state: UserState) {
            console.log("in isLoggedIn getter");
            return state.user !== undefined;
        }
    }
};
export default UserService;