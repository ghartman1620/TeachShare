import Vue from "vue";
import api from "../api";

// typescript 'require' workaround hack
declare function require(name:string): any;

var Cookie = require("tiny-cookie");
const UserService = {
    state: {
        token: "",
        loggedIn: false,
        profile: undefined
    },
    mutations: {
        SET_TOKEN: (state, credentials) => {
            var response = credentials.response;
            state.token = response.data.body.access_token;
            console.log(response.data.body);
            var date = new Date();
            console.log();
            date.setTime(date.getTime() + (response.data.body.expires_in * 1000 - 120000));
            Cookie.set("token", response.data.body.access_token, date.toISOString());
            Cookie.set("loggedIn", true, date.toISOString());
            Cookie.set("userId", response.data.userId, date.toISOString());
            Cookie.set("username", response.data.username, date.toISOString());

            console.log(response.data.body.access_token);

            console.log(document.cookie);
            Object.assign(api.defaults, {headers: {authorization: "Bearer " + state.token}});

            if (credentials.persist) {
                console.log("in windowstorage");
                window.localStorage.setItem("access_token", response.data.body.access_token);
                window.localStorage.setItem("refresh_token", response.data.body.refresh_token);
                window.localStorage.setItem("userId", response.data.userId);
                window.localStorage.setItem("username", response.data.username);
            }
            console.log("done with set token mutation");
        },
        CLEAR_USER: (state) => {
            state.loggedIn = false;
            state.profile = undefined;
        },
        LOGIN_USER: (state, user) => {
            state.profile = user;
            state.loggedIn = true;
        }
    },
    actions: {
        fetchCurrentUser: (state, userID) => {
            return new Promise((resolve, reject) => {
                api
                    .get(`users/${userID}/`)
                    .then(response => {
                        state.commit("LOGIN_USER", response.data);
                        resolve(response.data);
                    })
                    .catch(err => console.log(err));
            });
        },
        login: (context, credentials) => {
            console.log(credentials);
            var body = {
                username: credentials.username,
                password: credentials.pw,
                grant_type: "password"
            };
            var head = { headers: { "content-type": "application/json" } };

            return new Promise((resolve, reject) => {
                api.post("get_token/", body, head)
                    .then(function (response) {
                        console.log("success!");
                        context.commit("SET_TOKEN", {response: response, persist: credentials.persist});
                        console.log(context.state.token);
                        context.commit("LOGIN_USER", response.data.user);
                        console.log(response.data.user);
                        resolve(response);
                    })
                    .catch(function (err) {
                        console.log("oh no!");
                        console.log(err);
                        reject(err);
                    });
            });
        },
        logout: (context) => {
            Cookie.remove("token");
            Cookie.remove("loggedIn");
            Cookie.remove("userId");
            Cookie.remove("username");
            Object.assign(api.defaults, {headers: {}});

            window.localStorage.removeItem("access_token");
            window.localStorage.removeItem("refresh_token");
            window.localStorage.removeItem("userId");
            window.localStorage.removeItem("username");
            context.commit("CLEAR_USER");
        },
        createUser: (context, user) => {
            return new Promise((resolve, reject) => {
                api.post("users/", user)
                    .then(response => resolve(response))
                    .catch(function (error) {
                        reject(error);
                    });
            });
        }
    },
    getters: {
        getToken: (state) => state.token,
        getUser: (state, getters) => {
            if (state.loggedIn) {
                return getters.getCurrentUser;
            }
            return undefined;
        }
    }
};
export default UserService;