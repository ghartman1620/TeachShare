import Base from "@/components/Base.vue";
import * as Cookie from "tiny-cookie";
import Vue from "vue";
import Router from "vue-router";
import api from "../api";
import store from "../store";
import {logout} from "../store_modules/UserService";
import {AxiosPromise} from "axios";
import { setUser } from "../store_modules/UserService";
import User from "../user";


// typescript 'require' workaround hack
declare function require(name: string): any;

// route-splitting to minimize necessary download size and will download javascript as-needed.
const Home = () =>
    import ( /* webpackChunkName: "home" */ "../components/HomePage.vue");
const PostCreate = () =>
    import ( /* webpackChunkName: "post-create" */ "../components/PostCreate.vue");
const EditText = () =>
    import ( /* webpackChunkName: "edit-text" */ "../components/text/EditText.vue");
const EditVideo = () =>
    import ( /* webpackChunkName: "edit-video" */ "../components/video/EditVideo.vue");
const EditAudio = () =>
    import ( /* webpackChunkName: "edit-audio" */ "../components/audio/EditAudio.vue");
const EditImage = () =>
    import ( /* webpackChunkName: "edit-image" */ "../components/image/EditImage.vue");
const EditFile = () =>
    import ( /* webpackChunkName: "edit-file" */ "../components/file/EditFile.vue");
const EditTable = () =>
    import ( /* webpackChunkName: "edit-file" */ "../components/table/EditTable.vue");
const PostFeed = () =>
    import ( /* webpackChunkName: "post-feed" */ "../components/PostFeed.vue");
const PostDetail = () =>
    import ( /* webpackChunkName: "post-feed" */ "../components/PostDetail.vue");
const Comments = () =>
    import ( /* webpackChunkName: "comments" */ "../components/comments/Comments.vue");
const CommentEntry = () =>
    import ( /* webpackChunkName: "comments" */ "../components/comments/CommentEntry.vue");
const Login = () =>
    import ( /* webpackChunkName: "login" */ "../components/auth/Login.vue");
const Register = () =>
    import ( /* webpackChunkName: "register" */ "../components/auth/Register.vue");

const WebSocketComp = () =>
    import ( /* webpackChunkName: "register" */ "../components/WebSocket.vue");
const PermissionAdd = () =>
    import ( /* webpackChunkName: "permission-add" */ "../components/PermissionAdd.vue");
const DbTest = () =>
    import ( /* webpackChunkName: "db-test" */ "../components/DbTest.vue");


Vue.use(Router);

const router = new Router({
    mode: "history",
    routes: [
        {
            path: "/",
            component: Base,
            children: [
                { name: "base", path: "", component: Home },
                {
                    path: "/create",
                    name: "create",
                    component: PostCreate,
                    children: [
                        {
                            name: "permission-add",
                            path: "share",
                            component: PermissionAdd
                        },
                        {
                            name: "edit-text",
                            path: "text",
                            component: EditText
                        },
                        {
                            name: "edit-video",
                            path: "video",
                            component: EditVideo
                        },
                        {
                            name: "edit-audio",
                            path: "audio",
                            component: EditAudio
                        },
                        {
                            name: "edit-table",
                            path: "table",
                            component: EditTable

                        },
                        {
                            name: "edit-image",
                            path: "image",
                            component: EditImage
                        },
                        {
                            name: "edit-file",
                            path: "file",
                            component: EditFile
                        }
                    ]
                },
                {
                    name: "dashboard",
                    path: "/dashboard",
                    component: PostFeed
                },
                {
                    name: "posts",
                    path: "/posts/:post_id",
                    component: PostDetail
                },
                {
                    path: "/comments",
                    name: "Comments",
                    component: Comments,
                    props: {
                        comments: [{
                            user: 1,
                            id: 1,
                            content: "some fake text!"
                        }]
                    }
                },
                {
                    path: "/comments/:comment_id",
                    name: "Comment",
                    component: CommentEntry,
                    props: {
                        comment: {
                            user: 1,
                            id: 1,
                            content: "some fake text 2!"
                        }
                    }
                }
            ]
        },
        {
            path: "/login",
            name: "login",
            component: Login
        },
        {
            path: "/register",
            name: "register",
            component: Register
        },
        {
            path: "/indexeddb",
            name: "db-test",
            component: DbTest
        }
    ]
});

export function asLoggedIn(promise: AxiosPromise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
        promise
        .then((response) => {resolve(response); })
        .catch((err) => {
            if(err.response.status === 401){
                logout(store);
                router.push({name: "login"});
                reject(err);
            }
            else{
                console.error(err);
                reject(err);
            }
        });
    });
}

function verifyAndRefreshLogin(): Promise<any> {
    if (store.getters.isLoggedIn) {
        return new Promise((resolve) => {resolve(true); });
    } else if (Cookie.get("token") != null) {
        const u: User = new User();
        setUser(store, u);
        // store.dispatch("setUser", u);
        Object.assign(api.defaults, {headers: {Authorization: "Bearer " + Cookie.get("token")}});
        return new Promise((resolve) => {resolve(true); });
    } else if (window.localStorage.getItem("refreshToken") !== null){
        return new Promise((resolve, reject) => {
            const body = {
                grant_type: "refresh_token",
                refresh_token: window.localStorage.getItem("refreshToken"),
                username: window.localStorage.getItem("username")
            };
            const head = { headers: { "content-type": "application/json" } };
            Object.assign(api.defaults, {});
            api.post("get_token/", body, head).then((response: any) => {

                const user: User = new User(response.data.user.username,
                    response.data.user.pk,
                    response.data.user.email,
                    response.data.user.first_name,
                    response.data.user.last_name,
                    response.data.body.access_token,
                    new Date(Date.now() + response.data.body.expiresIn * 1000),
                    response.data.body.refresh_token);
                setUser(store, user);
                // store.dispatch("setUser", user);
                Object.assign(api.defaults, {headers: {Authorization: "Bearer " + response.data.body.access_token}});
                resolve(true);

            }).catch((error: any) => {
                resolve(false);
            });
        });
    } else {
        return new Promise((resolve) => {resolve(false); });
    }
}

const loginProtectedRoutes = ["create", "posts",
"edit-file", "edit-text", "edit-table", "edit-video", "edit-audio", "edit-image", "permission-add"];
const loggedOutRoutes = ["login", "register"];
router.beforeEach((to, from, next) => {
    if (loggedOutRoutes.some(val => val === to.name)) {
        verifyAndRefreshLogin().then((loggedIn) => {
            if (loggedIn) {
                next({ name: "dashboard" });
            } else {
                next();
            }
        });
    } else if (loginProtectedRoutes.some((val) => val === to.name)) {
        verifyAndRefreshLogin().then((loggedIn) => {
            if (loggedIn) {
                next();
            } else {
                next({ name: "login" });
            }
        });
    } else {
        next();
    }
});

export default router;
