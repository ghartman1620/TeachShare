import Vue from "vue";
import Router from "vue-router";
import Base from "@/components/Base";
import PostCreate from "@/components/PostCreate";
import Login from "@/components/Login";
import Test from "@/components/Test";
import FileUpload from "@/components/FileUpload";
import EditText from "@/components/EditText";
import VideoComponent from "@/components/video/VideoComponent";
import EditVideo from "@/components/video/EditVideo";
import HomePage from "@/components/HomePage";
import AudioComponent from "@/components/audio/AudioComponent";
import EditAudio from "@/components/audio/EditAudio";
import ImageComponent from "@/components/image/ImageComponent";
import EditImage from "@/components/image/EditImage";

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
        },
        {
            path: "/test",
            name: "Test",
            component: Test,
            children: [{
                path: "child",
                component: FileUpload
            }]
        },

        // this shows a correctly nested component. Uses
        // query parameters for certain settings

        {
            path: "/upload",
            component: Base,
            children: [{
                name: "upload",
                path: "",
                component: FileUpload
                    // props: { acceptedFileTypes: 'image/*' }
            }]
        },
        {
            path: "/video",
            component: Base,
            children: [{
                name: "video",
                path: "",
                component: VideoComponent,
                props: {
                    isEmbed: true,
                    source: "https://www.youtube.com/embed/-0asAVHvgDA",
                    autoplay: true,
                    // loop: true,
                    playlist: "BHgYtKkSEDA,5uGG1cZXnoA",
                    // source: 'https://www.w3schools.com/html/mov_bbb.mp4',
                    // controls: true,
                    // isFile: true,

                    // these are generic
                    height: 300,
                    width: 600
                }
            }]
        },
        {
            path: "/audio",
            component: Base,
            children: [{
                    name: "audio",
                    path: "",
                    component: AudioComponent,
                    props: {
                        body: "This is some body content.",
                        title: "This is a title!",
                        source: "http://fakeurl.com/file.mp3",
                        controls: true
                    }
                },
                {
                    name: "audio-edit",
                    path: "edit",
                    component: EditAudio,
                    props: {}
                }
            ]
        },
        {
            path: "/image",
            component: Base,
            children: [{
                    name: "image",
                    path: "",
                    component: ImageComponent,
                    props: {}
                },
                {
                    name: "image-edit",
                    path: "edit",
                    component: EditImage,
                    props: {}
                }
            ]
        }
    ]
});