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

<!-- Scroll to bottom functionality -->

<br><br><!-- this br is required so scroll() can function properly-->
<button class="invisible-button"></button>
</div>
</template>

<script>
import Vue from "vue";
import Post from "./Post";

export default {
    name: "PostFeed",
    components: { Post },
    data: function() {
        return {};
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
        scroll() {
            var offset =
                document.documentElement.scrollTop + window.innerHeight;
            var height = document.documentElement.offsetHeight;

            if (offset >= height) {
                console.log("scroll to bototm");
                //this.getPosts();
            }        
        },
        reloadPosts(){
            if(this.$route.query.term != undefined){
                this.$store.dispatch("simplePostSearch", this.$route.query.term);
            }
            else{
                this.$store.dispatch("fetchAllPosts");
            }
        }
    },
    beforeMount(){
        this.reloadPosts();
        
        var t = this;
        window.addEventListener(
            "scroll",
            function() {
                t.scroll();
            },
            false
        );
        console.log(this.$router.params);
    },
    mounted() {
        console.log(this.$router);
    },
    destroyed() {
        window.removeEventListener("scroll", function() {t.scroll()}, false);
    },
    watch: {
        $route (to, from){
            this.reloadPosts();
        }
    }
};
</script>

<style lang="scss" scoped>
$card-shadow: 4px 8px 8px -1px rgba(0, 0, 0, 0.4);
$card-color: #96e6b3;

.invisible-button {
    background: transparent;
    border: none !important;
    font-size: 0;
}

.card-shadow {
    box-shadow: $card-shadow;
}

.post-container-card {
    background-color: $card-color;
}
</style>
