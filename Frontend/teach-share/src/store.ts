import { AxiosResponse } from "axios";
import Vue from "vue";
import Vuex, { ActionContext, ActionTree, StoreOptions } from "vuex";
import { ActionHandlerNoPayload, getStoreAccessors } from "vuex-typescript";

import api from "../src/api";
import { IRootState, Post, User, Comment, ContentType } from "./models";
import CommentService from "./store_modules/CommentService";
import FileService from "./store_modules/FileService";
import NotificationService from "./store_modules/NotificationService";
import PostCreateService from "./store_modules/PostCreateService";
import UserService from "./store_modules/UserService";
import YouTubeService from "./store_modules/YouTubeService";
import PostService from "./store_modules/PostService";
import { WatchStore } from "./WatchStore";
import Database from "./Database";

import WebSocket from "./WebSocket";

Vue.use(Vuex);

const state = {};

// var storeSocket = new WebSocket("ws://127.0.0.1:3012/");

var storeSocket: WebSocket = WebSocket.getInstance();

const p = new Post(3, [], new User(1));
p.attachments = [];
p.concepts = [];
// return MessageStatus.ConnectionClosed;
p.comments = [new Comment(1, 1, 1, "")];
p.content = [];
p.content_type = ContentType.Game;
p.coreIdeas = [];
p.draft = false;
p.grade = 1;
p.likes = 0;
p.practices = [];
p.standards = [];
p.subject = 0;
p.tags = [];
p.title = "This is a post title";
// p.updated = new Date();

// storeSocket.sendCreate(p);
// storeSocket.sendGet(1);
// storeSocket.sendWatch(1);
storeSocket.sendWatch(2);
// storeSocket.sendUpdate(p);

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
// enum WSStatus {
//     CONNECTING=0,
//     OPEN,
//     CLOSING,
//     CLOSED

// }



// interface IMessage {
//     message: MessageType;
//     id?: number;
//     post?: any;
// }

// storeSocket.addEventListener("open", function(ev) {
//     console.log(ev);
// });


// storeSocket.onopen = (val) => {

//     console.log("[WS] Websocket successfully opened!");
//     const testUser = new User(1);
//     const testPost = new Post(10);
//     const testComment = new Comment(10, testPost, testUser, "some comment text");
//     const comments = new Array<Comment>();
//     comments.push(testComment);
//     testPost.comments = comments;
//     testPost.user = testUser;
//     console.log("[WS] Websocket sending: ", testPost);
//     const isCircular = circularRecordChecker(testPost);
//     console.log(isCircular);

//     const msg1: IMessage = {
//         message: MessageType.Get,
//         id: 1
//     };

//     const msg2: IMessage = {
//         message: MessageType.Get,
//         post: testPost.idify(),
//     };
//     msg2.post.content = {
//         "type": "text",
//         "content" :"<b>bold</b>"
//     }
//     msg2.post.title = "that was an error";
//     console.log(msg2.post);
//     if (!isCircular) {
//         storeSocket.send(JSON.stringify(msg1)); // JSON.stringify(testPost)
//     } else {
//         // map all the internal structures to maps of pk's
//         /*msg2.post!.comments = comments.map((val, ind, arr) => {
//             if (typeof val.pk !== "undefined") {
//                 return Number(val.pk);
//             }
//             return 0;
//         });*/
//         console.log(JSON.stringify(msg2));
//         storeSocket.send(JSON.stringify(msg2));
//     }
// };
const storeOptions: StoreOptions<IRootState> = {
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

const store = new Vuex.Store<IRootState>(storeOptions);

// storeSocket.onmessage = (msg) => {
//     console.log("[WS] Websocket recieved message: ", msg);
//     let val = JSON.parse(msg.data);
//     console.log(val);
//     let p: Post = Post.pkify(val);
//     mutUpdate(store, p);
// };

import {getMap, mutCreate, mutUpdate} from "./store_modules/PostService";
/*
 * After we've declared all of our store modules we can now add a message listener to the websocket.
 * Can't do it in websocket because this function depends on our store modules, and if websocket itself had
 * a store dependency we'd have a circular dependency and would cause all sorts of errors.
*/
WebSocket.getInstance().addMessageListener( (msg) => {
    const val = JSON.parse(msg.data)[0];
    const p: Post = Post.pkify(val);
    const db: Database = Database.getInstance();
    db.getPost(p.pk as number).then((post) => {
        db.putPost(p);
    }).catch();
    if (getMap(store).has(p.pk!.toString())) {
        mutUpdate(store, p);
    } else {
        mutCreate(store, p);
    }
    return undefined;
});
export default store;
