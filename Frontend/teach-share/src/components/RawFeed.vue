<template>
<div>
<router-view/>
    <div :key="post.pk" v-for="(post, index) in posts">
        <b-card >
            <post
                :maxHeight="500"
                :post="post"
                :index="index">
            </post>
        </b-card>
        <br><br> 
    </div> 
</div>
</template>

<script>
import Vue from "vue";
import Post from "./Post";
import SideBar from "./SideBar.vue";


export default {
    name: "RawFeed",
    components: { Post },
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
            this.$store.dispatch("fetchAllPostsRaw");
        }
    },
    created(){
        this.getPosts();
    },
    mounted() {
        this.getPosts();
    },
    destroyed() {},
    watch: {}
};
</script>

<style lang="scss" scoped>
$card-shadow: 4px 8px 8px -1px rgba(0, 0, 0, 0.4);
$card-color: #96e6b3;



</style>
