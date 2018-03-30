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
import { Post } from "../../models";
import CommentEntry from "./CommentEntry.vue";
import { getCommentsForPost } from "../../store_modules/comments/CommentService";

@Component({
    name: "Comments",
    components: { CommentEntry },
    props: [
        "post"
    ]
})
export default class Comments extends Vue {
    @Prop({required: true}) post;

    get watchComments() {
        return getCommentsForPost(this.$store)(this.post.pk as number);
    }
    mounted() {}
}
</script>

<style lang="scss" scoped>

</style>
