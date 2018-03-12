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

<script>
import CommentEntry from "./CommentEntry";

export default {
    name: "comments",
    props: ["post"],
    components: { CommentEntry },
    computed: {
        watchComments() {
            return this.$store.getters.getCommentsByPost(this.post.pk);
        },
        
    },
    mounted() {
        
    }
};
</script>

<style lang="scss" scoped>

</style>
