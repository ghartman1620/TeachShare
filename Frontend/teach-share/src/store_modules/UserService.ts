import Vue from "vue";
import api from "../api";
import { User } from "../user";

// typescript 'require' workaround hack
declare function require(name:string): any;

var Cookie = require("tiny-cookie");


const UserService = {
    state: {
        user: null,
    },
    mutations: {
        SET_USER: (state, user: User): void => {
            state.user = user;
        },
    },
    actions: {
        createUser: (context, user) => {
            return new Promise((resolve, reject) => {
                api.post("users/", user)
                    .then(response => resolve(response))
                    .catch(function (error) {
                        reject(error);
                    });
            });
        },
        setUser: (context, user: User) => {
            context.commit("SET_USER", user);
        }
    },
    getters: {
        getLoggedInUser: (state) => state.user,
    }
};
export default UserService;