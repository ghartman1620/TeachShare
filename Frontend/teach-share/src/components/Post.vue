<template>
    <see-more @expanded="getComments" :maxHeight="actualMaxHeight">
        <div :id="index" class="container-fluid card">
            <div class="row">
                <div class="col-12">
                    <br>
                    <h2 class="text-center"><strong>{{post.title}}</strong></h2>
                    <h5 class="text-center">posted: {{ post.updated | moment("from") }}</h5>
                    <h6 class="text-center">by <b-badge variant="dark">{{fullUsername}}</b-badge></h6>
                    <h4 class="text-right">
                        Tags:
                        <span :key="index" v-for="(tag,index) in post.tags">
                            <span class="tag-entry badge badge-info">{{tag}}
                                <!-- <button id="tag-delete-button" type="button" class="btn btn-sm btn-dark" >{{"x"}}</button> -->
                            </span>
                        </span>
                    </h4>
                    <hr>
                    <div v-if="post.original_post" style="text-align: center;">
                        This post was derived from a <router-link :to="{name: 'detail', params: {post_id: post.original_post}}">post</router-link>
                             authored by {{getOriginalUser().username}}
                    </div>
                    <hr>
                    <div>
                        <div :key="element.pk" v-for="element in post.content">
                            <post-element :element="element" :index="index"/>
                        </div>
                    </div>
                </div> <!-- div class="col-12" -->
            </div> <!-- div class="row" -->
            <hr>
            <h3>Comments: </h3>
            <br>
            <b-row>
                <b-col cols="12">
                    <comments
                        :post="post">
                    </comments>
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="12">
                    <b-container>
                        <b-form-textarea
                            :rows="4"
                            v-model="newCommentText">
                        </b-form-textarea>
                        <b-row>
                            <b-col offset="3" cols="6" offset-md="4" md="5" offset-lg="4" lg="4">
                                <br>
                                <b-btn
                                    @click="submitComment"
                                    block
                                    :disabled="!textLength"
                                    variant="primary">
                                    <font-awesome-icon icon="check" fixed-width></font-awesome-icon>
                                    Submit
                                </b-btn>
                            </b-col>
                        </b-row>
                        <br><br>
                    </b-container>
                </b-col>
            </b-row>
        </div> <!-- div :id="index"... -->
    </see-more>
</template>

<script lang="ts">

import { Component, Prop, Vue } from "vue-property-decorator";
import SeeMore from "./SeeMore.vue";
import PostElement from "./PostElement.vue";
import Comments from "./comments/Comments.vue";
import CommentEntry from "./comments/CommentEntry.vue";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import forEach from "lodash/forEach";
import Logger from "../logging/logger";
import {Comment, Post, User} from "../models";
import { createUpdateComment, getByPost, getCommentsForPost } from "../store_modules/CommentService";
import { fetchUser, getUserByID, getLoggedInUser } from "../store_modules/UserService";

@Component({
    components: {
        SeeMore,
        PostElement,
        Comments,
        CommentEntry,
        FontAwesomeIcon
    },
    name: "Post",
    props: {
        post: {
            type: Post,
            default: function() { return new Post(); },
            required: true,
            validator: p => p instanceof Post
        }, 
        index: {
            type: Number
        }, 
        maxHeight: {
            type: Number
        }}
})
export default class PostComp extends Vue {
    @Prop() post: Post;
    @Prop() index: number;
    @Prop() maxHeight: number;

    newCommentText: string = "";

    get actualMaxHeight() {
        // @TODO: make this actually show the WHOLE content, not just an arbitrarily huge maxHeight
        return this.maxHeight !== undefined ? this.maxHeight : 10000000;
    }
    get textLength() {
        return this.newCommentText.length > 10;
    }
    get fullUser() {
        return getUserByID(this.$store)(this.post.user);
    }
    get fullUsername() {
        if (this.fullUser !== undefined) {
            return this.fullUser.username;
        }
        return "";
    }
    constructor() {
        super();
    }

    getOriginalUser(){
        return getUserByID(this.$store)(this.post.original_user);
    }

    getComments() {
        var vm = this;
        getByPost(this.$store, Number(this.post.pk)).then(function(res) {
            for (let c of getCommentsForPost(vm.$store)(vm.post.pk as number)) {
                console.log(c);
                let hasUser = vm.$store.state.user.otherUsers.find(
                    (val: User) => {
                        console.log(val, c, typeof c);
                        if (val.pk === ((c as Comment).user as number)) {
                            return true;
                        }
                        return false;
                    }
                );
                let currentUser = vm.$store.state.user.user;
                if (typeof c !== "undefined" && typeof hasUser === "undefined") {
                    fetchUser(vm.$store, c.user as number);
                } 
            }
        });
    }
    submitComment() {
        var vm = this;
        let currentUser = this.$store.getters.getLoggedInUser;
        if (currentUser === undefined) {
            // this.$log("cookie: ", this.$cookie.get("userId"));

            // @TODO: fix this
            // this.$store.fetchCurrentUser();
            
            // this.$cookie.get("userId")
            this.actualSubmit();
        } else {
            this.actualSubmit();
        }

        this.newCommentText = "";
    }
    actualSubmit() {
        var vm = this;
        this.$logDanger(this.$store.state.user.profile);
        if (typeof getLoggedInUser(this.$store) !== "undefined") {
            let comment = new Comment(
                undefined,
                Number(this.post.pk),
                (getLoggedInUser(this.$store) as User).pk as number,
                this.newCommentText
            );
            createUpdateComment(this.$store, comment).then(function(ret: any): any {
                    if (ret.status < 300) {
                        console.log(ret);
                        vm.$notifySuccess(
                            "Your comment was successfully posted!"
                        );
                    } else {
                        let total = "";
                        ret.forEach((val, key) => {
                            let currentValue = val.join(" ");
                            total = `${total} "${key}: ${currentValue}" `;
                        });

                        vm.$notifyDanger(
                            `There was a problem submitting your comment. ${total}`
                        );
                    }
                })
                .catch(function(ret) {
                    console.log(ret);
                    vm.$notifyDanger(
                        `There was a problem submitting your comment.`
                    );
                });
        }
    }

    created() {
        // this.$store.dispatch("fetchUser", this.post.user);
        if(this.post.original_user){
            console.log("hi");
            console.log(this.post.original_user);
            fetchUser(this.$store, this.post.original_user);
        }
    }
};
</script>

<style lang="scss" scoped>
.tag-entry {
    padding: 6px;
    margin: 4px;
}
</style>
