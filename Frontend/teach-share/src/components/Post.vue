<template>
    <see-more @expanded="getComments" :maxHeight="actualMaxHeight">
        <div :id="index" class="container-fluid card">
            <div class="row">
                <div class="col-12">
                    <br>
                    <h2 class="text-center"><strong>{{post.title}}</strong></h2>
                    <h5 class="text-center">posted: {{ post.updated | moment("from") }}</h5>
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

<script>
import Vue from "vue";
import SeeMore from "./SeeMore";
import PostElement from "./PostElement";
import Comments from "./comments/Comments";
import CommentEntry from "./comments/CommentEntry";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import forEach from "lodash/forEach";

export default {
    name: "Post",
    components: {
        SeeMore,
        PostElement,
        Comments,
        CommentEntry,
        FontAwesomeIcon
    },
    props: ["post", "index", "maxHeight"],
    data: function() {
        return {
            newCommentText: ""
        };
    },
    computed: {
        actualMaxHeight() {
            // @TODO: make this actually show the WHOLE content, not just an arbitrarily huge maxHeight
            return this.maxHeight !== undefined ? this.maxHeight : 1000000;
        },
        textLength() {
            return this.newCommentText.length > 10;
        }
    },
    methods: {
        getComments() {
            var vm = this;
            this.$store
                .dispatch("fetchCommentsForPost", this.post.pk)
                .then(function(res) {
                    vm.$log(res);
                    for (let c of vm.post.comments) {
                        vm.$log(c);
                        vm.$store.dispatch("fetchUser", c.user);
                    }
                });
        },
        submitComment() {
            var vm = this;
            this.$store
                .dispatch("createOrUpdateComment", {
                    pk: undefined,
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
            this.newCommentText = "";
        }
    },
    mounted() {}
};
</script>

<style lang="scss" scoped>

</style>
