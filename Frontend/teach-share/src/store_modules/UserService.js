import Vue from "vue";
import api from "../api";

const client_id = "8CXoONZmQTKF4I1xiLY9vR7YR0tsdMVr03Jk29MG";
const client_secret = "kHwXPXAIttqTcEYCFdiIifIborJS9e0We8FyuyDJx3hDNNfF9zZFAuCoRwU5NnNrgO8lBbOhcC0KEZ9iTTBez6FQsQLXwJYxiCIqQrzbQdR7ubDCLBIv2qsU4hXthIvo";

const UserService = {
    state: {
        token: '',
    },
    mutations: {
        SET_TOKEN: (state, data)  => {
            data = JSON.parse(data);
            state.token = data.access_token;
            console.log(data);
            var date = new Date();
            date.setTime(date.getTime()+(data.expires_in*1000));
            
            document.cookie = "token=" + data.access_token;
            document.cookie = "expires=" + date.toUTCString();
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
                .then(response => context.commit("SET_TOKEN", response.data))
                .catch(err => console.log(err));
        },
        logout: (context) => {
            document.cookie = "token=";
            document.cookie = "expires=";
        }
    },
    getters: {

    }
};
export default UserService;