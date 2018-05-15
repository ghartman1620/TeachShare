import { AxiosResponse } from "axios";
import Vue from "vue";
import Vuex, { ActionContext, ActionTree, StoreOptions } from "vuex";
import { getStoreAccessors, ActionHandlerNoPayload } from "vuex-typescript";

import api from "../src/api";
import { IRootState, Post, User, Comment } from "./models";
import CommentService from "./store_modules/CommentService";
import FileService from "./store_modules/FileService";
import NotificationService from "./store_modules/NotificationService";
import PostCreateService from "./store_modules/PostCreateService";
import UserService from "./store_modules/UserService";
import YouTubeService from "./store_modules/YouTubeService";
import PostService from "./store_modules/PostService";
import { WatchStore } from "./WatchStore";
import Database from "./Database";

Vue.use(Vuex);

const state = {};

var storeSocket = new WebSocket("ws://127.0.0.1:3012/");

function circularRecordChecker(record: any, seen: any[] = []) {

    // check if it's already in the provided 'seen' array.
    const found = seen.find((val) => val === record);

    // if it was actually found, return immediately
    if (typeof found !== "undefined") { return true; }
    seen.push(record);

    // check whether there are object or array sub-objects, iterates
    // through them and make sure there are no cycles.
    if (typeof record === "object") {
        for (const k of Object.keys(record)) {
            if (typeof k !== "undefined") {
                let result = circularRecordChecker(record[k], seen);
                if (result) { return true; }
            }
        }
    } else if (record instanceof Array) {
        for (const v of record) {
            if (typeof v !== "undefined") {
                let result = circularRecordChecker(v, seen);
                if (result) { return true; }
            }
        }
    }
    return false;
}
enum WSStatus {
    CONNECTING=0,
    OPEN,
    CLOSING,
    CLOSED

}

enum MessageType {
    Get = "Get",
    Watch = "Watch",
    Update = "Update",
    Create = "Create"
}

interface ITestPost {
    id: number;
    title: string;
    content: object;
    // pub updated: PgTimestamp,
    likes: number;
    // pub timestamp: PgTimestamp,
    tags: object;
    user_id: number;
    draft: boolean;
    content_type: number;
    grade: number;
    // length: PgInterval,
    subject: number;
    crosscutting_concepts: number[];
    disciplinary_core_ideas: number[];
    practices: number[];
}

interface IMessage {
    message: MessageType;
    id?: number;
    post?: ITestPost;
}

storeSocket.addEventListener("open", function(ev) {
    console.log(ev);
});

function default_post(): ITestPost {
    const result: ITestPost = {
        id: 2,
        title: "post number 2",
        content: {
            type: "text",
            content : "<b>bold</b>"
        },
        // pub updated: PgTimestamp,
        likes: 10,
        // pub timestamp: PgTimestamp,
        tags: {},
        user_id: 2,
        draft: false,
        content_type: 0,
        grade: 12,
        // length: PgInterval,
        subject: 2,
        crosscutting_concepts: [1],
        disciplinary_core_ideas: [1, 3, 5],
        practices: [2],
    };
    return result;
}

storeSocket.onopen = (val) => {

    console.log("[WS] Websocket successfully opened!");
    const testUser = new User(1);
    const testPost = new Post(10);
    const testComment = new Comment(10, testPost, testUser, "some comment text");
    const comments = new Array<Comment>();
    comments.push(testComment);
    testPost.comments = comments;
    testPost.user = testUser;
    console.log("[WS] Websocket sending: ", testPost);
    const isCircular = circularRecordChecker(testPost);
    console.log(isCircular);

    // const msg2: IMessage = {
    //     message: MessageType.Get,
    //     id: 1
    // };

    const msg1: IMessage = {
        message: MessageType.Create,
        post: default_post(),
        // id: 1,
    };
    storeSocket.send(JSON.stringify(msg1));

    // console.log(msg1.post);
    // if (!isCircular) {
    //     storeSocket.send(JSON.stringify(msg1)); // JSON.stringify(testPost)
    // } else {
    //     // map all the internal structures to maps of pk's
    //     /*msg2.post!.comments = comments.map((val, ind, arr) => {
    //         if (typeof val.pk !== "undefined") {
    //             return Number(val.pk);
    //         }
    //         return 0;
    //     });*/
    //     console.log(JSON.stringify(msg2));
    //     storeSocket.send(JSON.stringify(msg2));
    // }
};

storeSocket.onmessage = (val) => {
    console.log("[WS] Websocket recieved raw string: ", val.data);
    console.log("[WS] Websocket recieved message: ", JSON.parse(val.data));
};

const store: StoreOptions<IRootState> = {
    strict: false, // process.env.NODE_ENV !== "production",
    modules: {
        fs: FileService,
        yt: YouTubeService,
        create: PostCreateService,
        post: PostService,
        notify: NotificationService,
        comment: CommentService,
        user: UserService
    },
    plugins: [WatchStore]
};

export default new Vuex.Store<IRootState>(store);
