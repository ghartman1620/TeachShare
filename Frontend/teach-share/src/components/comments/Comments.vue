<template>
    <div>
        <div :key="comment.id" v-for="comment in comments">
            <comment-entry
            :comment="comment">
            </comment-entry>
        </div>
    </div>
</template>

<script>
import CommentEntry from "./CommentEntry";

export default {
    name: "comments",
    props: ["comments"],
    components: { CommentEntry }
}
</script>

<style lang="scss" scoped>

</style>
