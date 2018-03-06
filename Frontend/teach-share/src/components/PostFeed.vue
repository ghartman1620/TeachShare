<template>
<div>
<router-view/>
<div :key="post.pk" v-for="(post, index) in posts">
    <post
        :maxHeight="500"
        :post="post"
        :index="index">
    </post>
    <br><br> 
</div>

<!-- Scroll to bottom functionality -->

<br><br><!-- this br is required so scroll() can function properly-->
<button @click="getPosts" class="invisible-button"></button>
</div>
</template>

<script>
import Vue from "vue";
import Post from "./Post";

export default{
    name: "PostFeed",
    components: {Post},
    data: function() {
        return {}
    },
    computed: { 
        posts: function() {
            return this.$store.getters.getPosts();
        }

    },
    methods: {
        getPosts: function() {
            this.$store.dispatch("fetchAllPosts");
        },
        scroll(){
            var offset = document.documentElement.scrollTop + window.innerHeight;
            var height = document.documentElement.offsetHeight;

            if (offset >= height) {
                console.log("scroll to bototm");
                //this.getPosts();
            }        
        },
    },
    beforeMount(){
        this.getPosts();
        var t = this;
        window.addEventListener("scroll", function() {t.scroll()}, false);
        console.log(this.$router.params)
    },
    mounted() {
        console.log(this.$router)
    },
    destroyed() {
        window.removeEventListener("scroll", function() {t.scroll()}, false);
    }

}

</script>

<style lang="scss" scoped>

.invisible-button {
    background: transparent;
    border: none !important;
    font-size:0;
}


</style>
