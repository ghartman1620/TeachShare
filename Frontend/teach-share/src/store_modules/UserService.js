import Vue from "vue";
import api from "../api";

var Cookie = require("tiny-cookie");
const UserService = {
    state: {
        token: "",
    },
    mutations: {
        SET_TOKEN: (state, credentials)  => {
            var response = credentials.response
            state.token = response.data.body.access_token;
            console.log(response.data.body);
            var date = new Date();
            console.log(this);
            date.setTime(date.getTime()+(response.data.body.expires_in*1000-120000));
            Cookie.set("token", response.data.body.access_token, date.toGMTString());
            Cookie.set("loggedIn",true, date.toGMTString());
            Cookie.set("userId", response.data.userId, date.toGMTString());
            Cookie.set("username", response.data.username, date.toGMTString());
            
            console.log(response.data.body.access_token);

            console.log(document.cookie);
            Object.assign(api.defaults, {headers: {authorization: "Bearer " + state.token}});
        
            
            if(credentials.persist){
                console.log("in windowstorage");
                window.localStorage.setItem("access_token", response.data.body.access_token);
                window.localStorage.setItem("refresh_token", response.data.body.refresh_token);
                window.localStorage.setItem("userId", response.data.userId);
                window.localStorage.setItem("username", response.data.username);
                
            }
            console.log("done with set token mutation");
        }
    },
    actions: {

        login: (context, credentials) => {
            console.log(credentials);
            var body = {
                username: credentials.username,
                password: credentials.pw,
                grant_type: "password"
            };
            var head = { headers: { "content-type": "application/json" } };
            
            return new Promise((resolve, reject) => {
                api.post('get_token/', body, head)
                .then(function(response) {
                    console.log("success!");
                    context.commit("SET_TOKEN", {response: response, persist: credentials.persist});
                    console.log(context.state.token);
                    resolve(context.state.token);
                })
                .catch(function(err) {
                    console.log("oh no!")
                    console.log(err);
                    reject(err);

                })
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
                        

        },
        createUser: (context, user) => {
            return new Promise((resolve, reject) => {
                api.post("users/", user)
                    .then(response => resolve(response))
                    .catch(function (error) {
                        reject(error)
                    });
            });
        }
    },
    getters: {
        getToken: (state) => state.token,
    }
};
export default UserService;