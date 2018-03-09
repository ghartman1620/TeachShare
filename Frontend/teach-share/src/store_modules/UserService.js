import Vue from "vue";
import api from "../api";

const client_id = "8CXoONZmQTKF4I1xiLY9vR7YR0tsdMVr03Jk29MG";
const client_secret = "kHwXPXAIttqTcEYCFdiIifIborJS9e0We8FyuyDJx3hDNNfF9zZFAuCoRwU5NnNrgO8lBbOhcC0KEZ9iTTBez6FQsQLXwJYxiCIqQrzbQdR7ubDCLBIv2qsU4hXthIvo";

const UserService = {
    state: {
        token: '',
    },
    mutations: {
        SET_TOKEN: (state, response)  => {
            state.token = response.data.body.access_token;
            console.log(response.data.body);
            var date = new Date();
            date.setTime(date.getTime()+(response.data.bodyexpires_in*1000));
            
            document.cookie = "token=" + response.data.body.access_token;
            document.cookie = "expires=" + date.toUTCString();
            document.cookie = "loggedIn=" + "yes";
            document.cookie = "userId=" + response.data.userId;
            console.log(response.data.body.access_token);
            //this worked previously - check out last commit & see what i did here
            Object.assign(api.defaults, {headers: {authorization : "Bearer " + response.data.body.access_token}});
            console.log(document.cookie);
            console.log(api.headers);
            if(response.persist){
                window.localStorage.setItem('access_token', response.data.body.access_token);
                window.localStorage.setItem('refresh_token', response.data.body.refresh_token);
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
                .post("auth/get_token/", body, head)
                .then(response => context.commit("SET_TOKEN", {data: response.data, persist: credentials.persist}))
                .catch(err => console.log(err));
        },
        logout: (context) => {
            document.cookie = "token=";
            document.cookie = "expires=";
            document.cookie = "loggedIn=";
        },

    },
    getters: {

    }
};
export default UserService;