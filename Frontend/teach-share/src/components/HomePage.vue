<template>
<div>
    <b-jumbotron 
        header="Welcome to TeachShare!"
        lead="The site for teachers to share lesson plans, talk and learn.">
        <hr class="my-4">
        <p>
            Take a look at the available lesson plans by searching above.
        </p>
        <b-btn @click.prevent="seePosts" variant="primary">See posts</b-btn>
        <b-btn @click="createPost" variant="success">Create a post</b-btn>
    </b-jumbotron>
    <!-- <raw-feed v-if="showPosts"></raw-feed> -->
    
</div>
</template>

<script>
import Vue from "vue";
import RawFeed from "./RawFeed";

export default Vue.component("base-page", {
    components: { RawFeed },
    props: [],
    data() {
        return {
            showPosts: false
        };
    },
    methods: {
        seePosts(event) {
            // this.$logSuccess(event);
            // this.$store.dispatch("fetchAllPostsRaw");
            // this.showPosts = true;
            this.$router.push({ name: "dashboard" });
        },
        createPost() {
            this.$router.push({ name: "create" });
        }
    }
});
</script>

<style lang="scss" scoped>
// Adds some padding to the main body, so that it's not underneath the navbar
.body-fluid {
    position: relative;
    padding-top: 100px;
}
</style>
