import { ActionContext } from "vuex";

import { AxiosResponse } from "axios";
import { getStoreAccessors } from "vuex-typescript";
import api from "../api";
import { IRootState } from "../models";
import User from "../user";

// typescript 'require' workaround hack
declare function require(name: string): any;
export interface UserState {
    user?: User;
    otherUsers: User[];
}

interface UserPostObject {
    username: string;
    password: string;
    email: string;
}
interface LoginCredentials {
    username: string;
    password: string;
    persist: boolean;
}

type UserContext = ActionContext<UserState, IRootState>;

const Cookie = require("tiny-cookie");

const state: UserState = {
    user: undefined,
    otherUsers: []
};

export const actions = {
    fetchUser: async (context: UserContext, userID: number): Promise<User> => {
        try {
            const resp: AxiosResponse<User> = await api.get(`users/${userID}/`);
            mutAddUser(context, resp.data);
            return resp.data;
        } catch (err) {
            return err;
        }
    },
    createUser: (context: UserContext, user: UserPostObject): Promise<any> => {
        return new Promise((resolve, reject) => {
            api.post("users/", user)
                .then((response) => resolve(response))
                .catch((error) => {
                    reject(error);
                });
        });
    },
    setUser: (context: UserContext, user: User): void  => {
        mutSetUser(context, user);
    },

    addUser: (context: UserContext, user: User): void  => {
        mutAddUser(context, user);
    },
    // potentially move browser memory accesses to some other module in the future?
    logout: (context: UserContext): void => {
        Cookie.remove("token");
        Cookie.remove("loggedIn");
        Cookie.remove("userId");
        Cookie.remove("username");
        Object.assign(api.defaults, {headers: {}});

        window.localStorage.removeItem("refreshToken");
        window.localStorage.removeItem("username");
        mutClearUser(context);
    },
    login: (context: UserContext, credentials: LoginCredentials): Promise<any> => {
        const body = {
            username: credentials.username,
            password: credentials.password,
            grant_type: "password"
        };
        console.log(body);
        const head = { headers: { "content-type": "application/json" } };
        return new Promise( (resolve, reject) => {
            api.post("get_token/", body, head).then( (response: any) => {
                console.log(response);
                const user: User = new User(response.data.user.username,
                        response.data.user.pk,
                        response.data.user.email,
                        response.data.user.first_name,
                        response.data.user.last_name,
                        response.data.body.access_token,
                        new Date(Date.now() + response.data.body.expiresIn * 1000),
                        credentials.persist ? response.data.body.refresh_token : undefined);
                context.commit("SET_USER", user);
                resolve();

            }).catch( (error) => {
                reject(error);
            })
        });
    }
};

const mutations = {
    SET_USER: (state: UserState, user: User): void => {
        state.user = user;
    },
    ADD_USER: (state, user: User) => {
        console.log("ADDUSER: ", user);
        let index = state.otherUsers.findIndex((val) => val.pk === user.pk);
        console.log(index);
        if (index !== -1) {
            state.otherUsers.splice(index, user);
            console.log(state.otherUsers);
            return;
        }
        state.otherUsers.push(user);
        console.log(state.otherUsers);
    },
    CLEAR_USER: (state) => {
        state.user = undefined;
    }
};

export const getters = {
    getUserByID: (state) => id => {
        return state.otherUsers.find((val, ind, obj) => val.pk === id);
    },
    getLoggedInUser(state: UserState): User{
        console.log("in  getLoggedInUser");
        return state.user!;
    },
    isLoggedIn (state: UserState) {
        console.log("in isLoggedIn getter");
        return state.user !== undefined;
    }
};

const UserService = {
    strict: false, // process.env.NODE_ENV !== "production",
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
export default UserService;

/**
 * Type safe definitions for CommentService
 */
const { commit, read, dispatch } =
     getStoreAccessors<UserState, IRootState>("user");

/**
 * Actions Handlers
 */
export const fetchUser = dispatch(UserService.actions.fetchUser);
export const createUser = dispatch(UserService.actions.createUser);
export const setUser = dispatch(UserService.actions.setUser);
export const logout = dispatch(UserService.actions.logout);
export const login = dispatch(UserService.actions.login);
export const addUser = dispatch(UserService.actions.addUser);

/**
 * Getters Handlers
 */
export const getUserByID = read(UserService.getters.getUserByID);
export const getLoggedInUser = read(UserService.getters.getLoggedInUser);
export const isLoggedIn = read(UserService.getters.isLoggedIn);

/**
 * Mutations Handlers
 */
export const mutAddUser = commit(UserService.mutations.ADD_USER);
export const mutSetUser = commit(UserService.mutations.SET_USER);

export const mutClearUser = commit(UserService.mutations.CLEAR_USER);
