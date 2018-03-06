import Vue from "vue";
import Router from "vue-router";
import Base from "@/components/Base";
import Login from "@/components/Login";

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

export default new Router({
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