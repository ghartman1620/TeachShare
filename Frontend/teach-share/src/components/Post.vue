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
import {Comment, Post} from "../models";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    components: {
        SeeMore,
        PostElement,
        Comments,
        CommentEntry,
        FontAwesomeIcon
    },
    name: "post",
})
export default class PostComp extends Vue {
    @State("") state;
    @Action("fetchUser") fetchUser;
    @Action("fetchCommentsForPost") fetchCommentsForPost;
    @Action("fetchCurrentUser") fetchCurrentUser;
    @Action("createOrUpdateComment") createOrUpdateComment;
    @Getter("getCurrentUser") getCurrentUser;
    @Getter("getUserByID") getUserByID;

    @Prop({})
    post!: Post;
    @Prop({})
    index!: number;
    @Prop({})
    maxHeight!: number;


    newCommentText: string = "";

    get actualMaxHeight() {
        // @TODO: make this actually show the WHOLE content, not just an arbitrarily huge maxHeight
        return this.maxHeight !== undefined ? this.maxHeight : 1000000;
    }
    get textLength() {
        return this.newCommentText.length > 10;
    }
    get fullUser() {
        return this.getUserByID(this.post.user);
    }
    get fullUsername() {
        if (this.fullUser !== undefined) {
            return this.fullUser.username;
        }
        return "";
    }

    getComments() {
        var vm: PostComp = this;
        this.fetchCommentsForPost(this.post.pk)
            .then(function(res) {
                console.log(res);
                var c: any;
                for (c in vm.post.comments) {
                    var comment = <Comment>c;
                    console.log(comment);
                    //We don't currently seem to be doing anything with hasUser?
                    
                    let hasUser = vm.state.users.find(
                        (val: any) => val.pk === c.pk
                    );

                    if (hasUser === null) {
                    }
                    vm.fetchUser(comment.user);
                }
            });
    }
    submitComment() {
        var vm = this;
        let currentUser = this.getCurrentUser.profile;
        if (currentUser === undefined) {
            // this.$log("cookie: ", this.$cookie.get("userId"));
            this.fetchCurrentUser();
                // this.$cookie.get("userId")
            this.actualSubmit();
        } else {
            this.actualSubmit();
        }

        this.newCommentText = "";
    }
    actualSubmit() {
        var vm = this;
        this.$logDanger(this.state.user.profile);
        this.createOrUpdateComment( {
                post: this.post.pk,
                text: this.newCommentText,
                user: this.$store.getters.getCurrentUser.profile.pk
            })
            .then(function(ret) {
                if (ret.status < 300) {
                    vm.$notifySuccess(
                        "Your comment was successfully posted!"
                    );
                } else {
                    let total = "";
                    forEach(ret, function(val, key) {
                        let currentValue = val.join(" ");
                        total = `${total} "${key}: ${currentValue}" `;
                    });

                    vm.$notifyDanger(
                        `There was a problem submitting your comment. ${total}`
                    );
                }
            })
            .catch(function(ret) {
                vm.$notifyDanger(
                    "There was an unknown error with your request."
                );
            });
    }

    created() {
        // this.$store.dispatch("fetchUser", this.post.user);
        this.$log(this.post);
    }
};
</script>

<style lang="scss" scoped>
.tag-entry {
    padding: 6px;
    margin: 4px;
}
</style>
