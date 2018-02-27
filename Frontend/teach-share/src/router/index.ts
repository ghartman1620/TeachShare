import Vue from "vue";
import Router from "vue-router";
import Base from "../components/Base.vue";
import PostCreate from "../components/PostCreate.vue";
import Login from "../components/Login.vue";
import Test from "../components/Test.vue";
import FileUpload from "../components/FileUpload.vue";
import EditText from "../components/EditText.vue";
import VideoComponent from "../components/video/VideoComponent.vue";
import EditVideo from "../components/video/EditVideo.vue";
import HomePage from "../components/HomePage.vue";
import AudioComponent from "../components/audio/AudioComponent.vue";
import EditAudio from "../components/audio/EditAudio.vue";
import ImageComponent from "../components/image/ImageComponent.vue";
import EditImage from "../components/image/EditImage.vue";
import EditFile from "../components/EditFile.vue";

import PostFeed from "../components/PostFeed.vue";
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