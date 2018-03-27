<template>
    <div>
        <post
            v-if="postLocal !== undefined"
            :post="postLocal"
            :index="postid">
        </post>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import PostComp from "./Post.vue";
import { Vue } from "vue-property-decorator";
import { Post, Comment } from "../models";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    props: {
        post: Post,
    },
    components: { PostComp }
})
export default class PostDetail extends Vue {
    @State("") state;
    @Getter("getPostById") getPostById;
    @Getter("getUsers") getUsers;
    @Action("fetchCommentsForPost") fetchCommentsForPost;
    @Action("fetechUser") fetchUser;
    @Action("fetchPost") fetchPost;
    post: Post = new Post();

    get postLocal(): any {
        return this.getPostById(this.$route.params.post_id);
    }
    get postid() {
        return this.postLocal !== undefined ? this.postLocal.pk : this.$route.params.post_id
    }

    getComments() {
        // let ae = new AudioElement(10, "filename.jpg");

        var vm: PostDetail = this;
        this.fetchCommentsForPost(this.postLocal.pk)
            .then(function(res) {
                console.log(res);
                var c: any;
                for (c in vm.post.comments) {
                    var comment = <Comment>c;
                    console.log(comment);
                    let hasUser: any = <any>(vm.getUsers).find((val: any) => val.pk === c.pk);
                    // vm.$logWarning("Post.vue", hasUser);
                    if (hasUser === null) {

                    }
                    vm.fetchUser(comment.user);
                }
            });
    }
    created() {
        this.fetchPost(this.$route.params.post_id).then((res) => {
            this.getComments();
        });
    }
}
</script>

<style lang="scss" scoped>

</style>
