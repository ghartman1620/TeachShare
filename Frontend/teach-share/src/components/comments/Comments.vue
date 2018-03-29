<template>
    <div>
        <div :key="comment.pk" v-for="comment in watchComments">
            <comment-entry
                :post="post"
                :user="comment.user"
                :comment="comment">
            </comment-entry>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Post from "../Post.vue";
import CommentEntry from "./CommentEntry.vue";
import { getCommentsForPost } from "../../store_modules/comments/CommentService";

@Component({
    name: "Comments",
    components: { CommentEntry },
    props: {
        post: Post
    }
})
export default class Comments extends Vue {
    @Prop({required: true}) post?: Post;

    constructor() {
        super();
        console.log("constructor for comments was called.");
    }

    get watchComments() {

        return getCommentsForPost(this.$store)(1);
    }
    mounted() {}
}
</script>

<style lang="scss" scoped>

</style>
