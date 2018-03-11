<template>
    <div>
        <post
            v-if="postLocal !== undefined"
            :post="postLocal"
            :index="postid"
        >
        </post>
        <br><br>
    </div>
</template>

<script>
import Post from "./Post";

export default {
    name: "PostDetail",
    components: {Post},
    data: function() {
        return { }
    },
    computed: {
        postLocal() {
            return this.$store.getters.getPostById(this.$route.params.post_id);
        },
        postid() {
            return this.postLocal !== undefined ? this.postLocal.pk : this.$route.params.post_id
        }
    },
    methods: {
        test() {
            var val = 
            this.postLocal = val;
        }
    },
    mounted() {
        this.$store.dispatch("fetchPost", this.$route.params.post_id);
    }
}
</script>

<style lang="scss" scoped>

</style>
