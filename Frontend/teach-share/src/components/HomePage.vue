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

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RawFeed from "./RawFeed.vue";

@Component({
    props: [],
    components: { RawFeed }
})

export default class HomePage extends Vue {
    showPosts: boolean = false

    seePosts(event) {
        // this.$store.dispatch("fetchAllPostsRaw");
        // this.showPosts = true;
        this.$router.push({ name: "dashboard" });
    }
    createPost() {
        this.$router.push({ name: "create" });
    }
    
}
</script>

<style lang="scss" scoped>
// Adds some padding to the main body, so that it's not underneath the navbar
.body-fluid {
    position: relative;
    padding-top: 100px;
}
</style>
