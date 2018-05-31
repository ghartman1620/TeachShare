<template>
        <!-- this is where a child route is rendered -->
        <router-link :to="{name: 'upload', query: { type: 'IMG', other: 'something'}}">Upload Image</router-link>

</template>

<script>
import { mapState } from "vuex";


export default {
    name: "Test",
    data: function() {
        return {
            userid: "",
            commentid: "",
            postid: ""
        }
    },
    computed: mapState({
        post: state => state.post,
        posts: state => state.posts,
        user: state => state.user,
        comment: state => state.comment,
        comments: state => state.comments
    }),
    methods: {
        loadPost(){
            fetch("http://localhost:8000/api/posts/1/")
            .then(resp => resp.json())
            .then(resp => this.message = resp)
            .catch(err => console.error("Error", err))
        },
        getUser(){
            this.$store.dispatch("fetchUser", this.userid);
        },
        getComment(){
            this.$store.dispatch("fetchComment", this.commentid);
        },
        getPost(){
            this.$store.dispatch("fetchPost", this.postid);
        },
        testStore(){
            this.$store.dispatch("fetchAllPosts");
        },
        getPostsByMyUser(){
            this.$store.dispatch("fetchFilteredPosts", this.userid);
        },
        getCommentsForPost(){
            this.$store.dispatch("fetchCommentsForPost", this.postid)
        }
    }
}
</script>

