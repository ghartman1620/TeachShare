<template>
<div>
<router-view/>
    <div :key="post.pk" v-for="(post, index) in posts">
        <div class="card post-container-card card-shadow">
            <div class="card-body">
                <post
                    :maxHeight="500"
                    :post="post"
                    :index="index">
                </post>
            </div>
        </div>
        <br><br> 
    </div> 
</div>
</template>

<script lang="ts">
import Post from "./Post.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
    name: "raw-feed",
    components: { Post }
})
export default class RawFeed extends Vue {
    get posts() {
        return this.$store.getters.getPosts();
    }    
    getPosts() {
            this.$store.dispatch("fetchAllPostsRaw");
    }
    created(){
        this.getPosts();
    }
    destroyed() {}

    watch() {}
};
</script>

<style lang="scss" scoped>
$card-shadow: 4px 8px 8px -1px rgba(0, 0, 0, 0.4);
$card-color: #96e6b3;



</style>
