import Vue from "vue";
import Router from "vue-router";
import Base from "@/components/Base";
import Login from "@/components/Login";
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

Vue.use(Router);

const router =  new Router({
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
        name: "Login",
        component: Login
    }
    ]
});

var Cookie = require("tiny-cookie");
const loginProtectedRoutes = ["create"];
router.beforeEach((to, from, next) => {
    
    console.log(window.localStorage.getItem("access_token"));

    console.log(window.localStorage.getItem("refresh_token"));
    console.log(window.localStorage.getItem("userId"));
    // drop token into cookie from browser storage after validated


    //Checking if the user is logged in for pages that require login access.

    //Are we accessing a login-protected page? If no, we don't need to be logged in.
    if(loginProtectedRoutes.includes(to.name)){
        //Is there a token in the cookie?
        var tokenCookieExists = false;
        var token = Cookie.get("token");
        if(token != undefined){    
  
            tokenCookieExists = true;
            Object.assign(api.defaults, {headers: {authorization : "Bearer " + token}});

            api.get('/verify_token')
                .then(response => console.log(response.data))
                .then(next()) //If cookie token is valid, access page
                .catch(err => next({path: "/login"})); //otherwise force login
        }
        if(!tokenCookieExists){
            //If not, access browser storage to look for the refresh token.
            var refresh_token = window.localStorage.getItem("refresh_token");
            if(refresh_token == undefined){
                next({path: "/login"});
            }
            else{
                var body = {
                    
                    grant_type: "refresh_token",
                    refresh_token: refresh_token,
                    username: window.localStorage.getItem("username")
                };
                var head = { headers: { "content-type": "application/json" } };
                api.post('/get_token', body,  head)
                    .then(response => store.commit("SET_TOKEN", {data: response.data, persist: true}))
                    .then(next())
                    .catch(err => next({path: "/login"}));
            }
        }
    }  
    next();
});

export default router;