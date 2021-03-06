import Vue from "vue";
import Router from "vue-router";
import Base from "@/components/Base";

import api from "../api";
import store from "../store";

// route-splitting to minimize necessary download size and will download javascript as-needed.
//
const Home = () => import(/* webpackChunkName: "home" */ "../components/HomePage.vue");
const PostCreate = () => import(/* webpackChunkName: "post-create" */ "../components/PostCreate.vue");
const EditText = () => import(/* webpackChunkName: "edit-text" */ "../components/text/EditText.vue");
const EditVideo = () => import(/* webpackChunkName: "edit-video" */ "../components/video/EditVideo.vue");
const EditAudio = () => import(/* webpackChunkName: "edit-audio" */ "../components/audio/EditAudio.vue");
const EditImage = () => import(/* webpackChunkName: "edit-image" */ "../components/image/EditImage.vue");
const EditFile = () => import(/* webpackChunkName: "edit-file" */ "../components/file/EditFile.vue");
const PostFeed = () => import(/* webpackChunkName: "post-feed" */ "../components/PostFeed.vue");
const PostDetail = () => import(/* webpackChunkName: "post-feed" */ "../components/PostDetail.vue");
const Comments = () => import(/* webpackChunkName: "comments" */ "../components/comments/Comments.vue");
const CommentEntry = () => import(/* webpackChunkName: "comments" */ "../components/comments/CommentEntry.vue");

const Login = () => import(/* webpackChunkName: "login" */ "../components/auth/Login.vue");
const Register = () => import(/* webpackChunkName: "register" */ "../components/auth/Register.vue");

Vue.use(Router);

const router = new Router({
    mode: "history",
    routes: [{
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
                    comments: [
                        {
                            user: 1,
                            id: 1,
                            content: "some fake text!"

                        }
                    ]
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
    }
    ]
});

// Returns true or false if user is logged in.
// Refreshes token if necessary.
function verifyAndRefreshLogin () {
    var token = Cookie.get("token");

    // @TODO: using != causes a type cast before comparison, leading to inconsistent results
    // consider using !== and finding the correct comparison, to avoid unknown behavior.
    if (token != undefined) {
        // verify token
        Object.assign(api.defaults, {headers: {authorization: "Bearer " + token}});

        return new Promise((resolve, reject) => {
            api.get("/verify_token")
                .then(response => resolve(true))
                .catch(err => resolve(false));
        });
    } else {
        var refresh_token = window.localStorage.getItem("refresh_token");
        if (refresh_token != undefined) {
            var body = {
                grant_type: "refresh_token",
                refresh_token: refresh_token,
                username: window.localStorage.getItem("username")
            };
            var head = { headers: { "content-type": "application/json" } };
            return new Promise((resolve, reject) => {
                api.post("/get_token", body, head)
                    .then(function (response) {
                        var date = new Date();
                        date.setTime(date.getTime() + (response.data.body.expires_in * 1000 - 120000));
                        Cookie.set("token", response.data.body.access_token, date.toGMTString());
                        Cookie.set("loggedIn", true, date.toGMTString());
                        Cookie.set("userId", response.data.userId, date.toGMTString());
                        Cookie.set("username", response.data.username, date.toGMTString());
                        window.localStorage.setItem("refresh_token", response.data.body.refresh_token);
                        window.localStorage.setItem("access_token", response.data.body.access_token);
                        resolve(true);
                    })
                    .catch(err => resolve(false));
            });
        }
        return new Promise((resolve, reject) => { resolve(false); });
    }
}

var Cookie = require("tiny-cookie");
const loginProtectedRoutes = ["create"];
const loggedOutRoutes = ["login", "register"];
router.beforeEach((to, from, next) => {
    if (loggedOutRoutes.includes(to.name)) {
        verifyAndRefreshLogin()
            .then(function (loggedIn) {
                if (loggedIn) {
                    next({name: "dashboard"});
                } else {
                    next();
                }
            });
    }

    // Are we accessing a login-protected page? If no, we don't need to be logged in.
    if (loginProtectedRoutes.includes(to.name)) {
        verifyAndRefreshLogin()
            .then(function (loggedIn) {
                if (loggedIn) {
                    next();
                } else {
                    next({name: "login"});
                }
            });
    } else {
        if (Cookie.get("token") == undefined && window.localStorage.getItem("refresh_token") != undefined) {
            verifyAndRefreshLogin().then(next());
        } else {
            next();
        }
    }
    next();
});

export default router;