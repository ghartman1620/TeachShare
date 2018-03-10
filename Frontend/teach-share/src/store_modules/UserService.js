import Vue from "vue";
import api from "../api";

var Cookie = require("tiny-cookie");
const UserService = {
    state: {
        token: "",
    },
    mutations: {
        SET_TOKEN: (state, response)  => {
            state.token = response.data.body.access_token;
            console.log(response.data.body);
            var date = new Date();
            console.log(this);
            date.setTime(date.getTime()+(response.data.body.expires_in*1000-120000));
            Cookie.set("token", response.data.body.access_token, date.toGMTString());
            Cookie.set("loggedIn","yes", date.toGMTString());
            Cookie.set("userId", response.data.userId, date.toGMTString());
            Cookie.set("username", response.data.username, date.toGMTString());
            
            console.log(response.data.body.access_token);

            console.log(document.cookie);

            
            if(response.persist){
                window.localStorage.setItem("access_token", response.data.body.access_token);
                window.localStorage.setItem("refresh_token", response.data.body.refresh_token);
                window.localStorage.setItem("userId", response.data.userId);
                window.localStorage.setItem("username", response.data.username);
                
            }
        }
    },
    actions: {
        login: (context, credentials) => {
            var body = {
                username: credentials.username,
                password: credentials.pw,
                grant_type: "password"
            };
            var head = { headers: { "content-type": "application/json" } };
            api
                .post("/get_token/", body, head)
                .then(response => context.commit("SET_TOKEN", {data: response.data, persist: credentials.persist}))
                .catch(err => console.log(err));
        },
        logout: (context) => {
            document.cookie = "token=";
            document.cookie = "expires=";
            document.cookie = "loggedIn=";
            window.localStorage.removeItem("access_token");
            window.localStorage.removeItem("refresh_token");
            window.localStorage.removeItem("userId");
            window.localStorage.removeItem("username");
                        

        },

    },
    getters: {

    }
};
export default UserService;