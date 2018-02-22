import Vue from "vue";
import Router from "vue-router";
import Base from "@/components/Base";
import Login from "@/components/Login";
import Test from "@/components/Test";
import HomePage from "@/components/HomePage";


import PostCreate from "@/components/PostCreate";
import EditText from "@/components/text/EditText";
import EditVideo from "@/components/video/EditVideo";
import EditAudio from "@/components/audio/EditAudio";
import EditImage from "@/components/image/EditImage";
import EditFile from "@/components/file/EditFile";

import PostFeed from "@/components/PostFeed";
//a change
Vue.use(Router);

export default new Router({
    routes: [{
            path: "/",
            component: Base,
            children: [
                { name: "base", path: "", component: HomePage },
                {
                    path: "/create",
                    name: "create",
                    component: PostCreate,

                    // the below are how they should be nested,
                    // but they don't currently work because of the
                    // tight coupling in the PostCreate class.
                    children: [
                        // {
                        //     name: 'video',
                        //     path: 'video',
                        //     component: VideoComponent,
                        //     props: { isFile: true }
                        // },
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
                                // children: [
                                //     {
                                //         name: 'edit-video-embed',
                                //         path: 'embed'
                                //         component: EditVideoEmbed
                                //     }
                                // ]
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