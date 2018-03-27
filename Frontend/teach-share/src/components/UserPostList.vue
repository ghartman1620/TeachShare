<template>
<div>
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

<script>
import Vue from "vue";
import api from "../api";
/*
api.get( some url).then(function (response){
    console.log(response)
    //set this component's post objects
})*/

// localhost:8000/api/posts/?user= this.$route.query.user
export default Vue.component("user-posts", {
    data() {
        return {
            posts: [],
        }
    },
    beforeCreate() {
        
    }
    

})

</script>