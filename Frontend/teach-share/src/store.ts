import { AxiosResponse } from "axios";
import Vue from "vue";
import Vuex, { ActionContext, ActionTree, StoreOptions } from "vuex";
import { ActionHandlerNoPayload, getStoreAccessors } from "vuex-typescript";

import api from "../src/api";
import Database from "./Database";
import { Comment, ContentType, IRootState, Post, User } from "./models";
import CommentService from "./store_modules/CommentService";
import FileService from "./store_modules/FileService";
import NotificationService from "./store_modules/NotificationService";
import PostCreateService from "./store_modules/PostCreateService";
import PostService from "./store_modules/PostService";
import UserService from "./store_modules/UserService";
import YouTubeService from "./store_modules/YouTubeService";
import { WatchStore } from "./WatchStore";

import WebSocket from "./WebSocket";

Vue.use(Vuex);

const state = {};

// var storeSocket = new WebSocket("ws://127.0.0.1:3012/");

const storeSocket: WebSocket = WebSocket.getInstance();

const p = new Post(1, [], new User(1));
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
storeSocket.sendGet(2);
storeSocket.sendWatch(1);
// storeSocket.sendWatch(2);
storeSocket.sendUpdate(p);

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
                const result = circularRecordChecker(record[k], seen);
                if (result) { return true; }
            }
        }
    } else if (record instanceof Array) {
        for (const v of record) {
            if (typeof v !== "undefined") {
                const result = circularRecordChecker(v, seen);
                if (result) { return true; }
            }
        }
    }
    return false;
}

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
    // plugins: [WatchStore]
};

const store = new Vuex.Store<IRootState>(storeOptions);

import {getMap, mutCreate, mutUpdate} from "./store_modules/PostService";
/*
 * After we've declared all of our store modules we can now add a message listener to the websocket.
 * Can't do it in websocket because this function depends on our store modules, and if websocket itself had
 * a store dependency we'd have a circular dependency and would cause all sorts of errors.
*/
WebSocket.getInstance().addMessageListener( (msg) => {
    console.log("Got a message!: " + msg.data.toString());
    const val = JSON.parse(msg.data);
    console.log("Value is: ");
    console.log(val);
    console.log(val.payload);

    const db: Database = Database.getInstance();
    if ("payload" in Object.keys(val)) {
        for (const post of val.payload) {
            console.log("Store listener pkifying a post");
            console.log("+++++++++++++++++", post.Post);
            const pkifiedPost: Post = Post.pkify(post.Post);
            // check if the post we got from the WS is saved in the DB.

            console.log("ATTEMPTING TO GET: ", pkifiedPost.pk as number);
            db.getPost(pkifiedPost.pk as number).then((dbCurrentPost) => {
                console.log("GOT INSIDE GETPOST");
                // If it is, we should save the post we got - because it's a post we've decided in the past to cache
                db.putPost(pkifiedPost);
            }).catch((err) => {
                console.log("There was a tremendous error -->", err);
            }); // If not, DON'T save it, because we're not saving every single post that arrives.

            // for all posts - db saved and otherwise, send it over to the store to get rendered by components.
            if (typeof pkifiedPost.pk !== "undefined" && getMap(store).has(pkifiedPost.pk!.toString())) {
                // it already exists in the store
                mutUpdate(store, pkifiedPost);
            } else {
                // it didn't already exist in the store - now it does!
                mutCreate(store, pkifiedPost);
            }
        }
    }
    return undefined;
});
export default store;
