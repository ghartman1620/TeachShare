import { AxiosResponse } from "axios";
import Vue from "vue";
import Vuex, { ActionContext, ActionTree, StoreOptions } from "vuex";
import { getStoreAccessors, ActionHandlerNoPayload } from "vuex-typescript";

import api from "../src/api";
import { IRootState, Post, User } from "./models";
import CommentService from "./store_modules/CommentService";
import FileService from "./store_modules/FileService";
import NotificationService from "./store_modules/NotificationService";
import PostCreateService from "./store_modules/PostCreateService";
import UserService from "./store_modules/UserService";
import YouTubeService from "./store_modules/YouTubeService";
import PostService from "./store_modules/PostService";
import { WatchStore } from "./WatchStore";

Vue.use(Vuex);

const state = {};

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
