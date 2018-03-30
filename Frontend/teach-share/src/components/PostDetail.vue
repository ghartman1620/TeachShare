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

import PostComp from "./Post.vue";
import { Vue, Component, Prop } from "vue-property-decorator";
import { Post, Comment, User } from "../models";
import { getByPost } from "../store_modules/comments/CommentService";

@Component({
    props: [
        "post"
    ],
    components: { "post": PostComp }
})
export default class PostDetail extends Vue {
    @Prop() post;
    // post: Post = new Post();

    get postLocal(): any {
        return this.$store.getters.getPostById(this.$route.params.post_id);
    }
    get postid() {
        return this.postLocal !== undefined ? this.postLocal.pk : this.$route.params.post_id
    }

    getComments() {
        // let ae = new AudioElement(10, "filename.jpg");

        var vm = this;
        // createUpdateComment(this.$store, )
        getByPost(this.$store, Number(this.$route.params.post_id)).then(function(res) {
            console.log(res);
            // for (let c of vm.post.comments) {
            //     console.log(c);
            //     let hasUser = vm.$store.state.users.find(
            //         (val: User) => val.pk === (c as Comment).pk
            //     );

            //     if (hasUser === null) {
            //     }
            //     if (typeof c !== "undefined") {
            //         // vm.$store.dispatch("fetchUser", c.user);
            //     }
            // }
        });
    }
    created() {
        this.$store.dispatch("fetchPost", this.$route.params.post_id).then((res) => {
            this.getComments();
        });
    }
}
</script>

<style lang="scss" scoped>

</style>
