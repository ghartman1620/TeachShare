<template>
<base-page>
<span slot="body">

<div v-for="(post,index) in posts">
    <div :style="getPostContainerStyle(index)" class="container card">
        <h3>{{post.title}}</h3>
        <div class="truncatedPostComponent">
        <div v-for="component in post.content">
            
            <post-component :component="component"></post-component>
        </div>
        </div>
        <div :style="getGradientStyle(index)"></div>
        <p id="seeMore" @click="expandPost(index)" v-html="seeMoreString(index)"></p>
    </div>
</div>
</span>
</base-page>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import PostComponentView from './PostComponentView';
const postContainerDefault = {
    maxHeight: "400px",
    height: "fit-content",
};
const postContainerExpanded = {
    height: "fit-content",
};
const gradientDefault = {
    position:"absolute",
    zIndex:"2",
    right:"0", 
    bottom:"0", 
    left:"0",
    height:"200px",
    background: "linear-gradient(to bottom,  rgba(255,255,255,0) 0%,rgba(255,255,255,1) 99%)"
};
const gradientExpanded = {

};

export default{
    name: "PostFeed",
    data: function() {
        return {
            expandedPosts: []
        }
    },
    computed: mapState({
        posts: state => state.posts,
        
    }),
    methods: {
        getPostContainerStyle(index){     
            if(this.expandedPosts.includes(index)){
                return postContainerExpanded
            }
            else{
                return postContainerDefault
            }
        },
        getGradientStyle(index) {
            if(this.expandedPosts.includes(index)){
                return gradientExpanded;
            }
            else{
                return gradientDefault;
            }
        },
        getPosts: function() {
            this.$store.dispatch("fetchAllPosts");
        },

        expandPost(index){
            for(var i = 0; i < this.expandedPosts.length; i++){
                if(this.expandedPosts[i] == index){
                    this.expandedPosts.splice(i, 1);
                    return;
                }
            }
            
            this.expandedPosts.push(index);
        },
        seeMoreString(index){
            if(this.expandedPosts.includes(index)){
                return "See Less"
            }
            else{
                return "See More";
            }
        }
    },
    beforeMount(){
        this.getPosts();

    },
}

</script>

<style lang="scss" scoped>

.truncatedPostComponent {
    overflow: hidden;
}
.gradient {
    position:absolute;
    z-index:2;
    right:0; bottom:0; left:0;
    height:200px;
    background: linear-gradient(to bottom,  rgba(255,255,255,0) 0%,rgba(255,255,255,1) 99%);
}
#seeMore {
    z-index: 3;
    width: 100%;
    text-align: center;
}
#seeMore:hover {
    background-color: gray;
}
#truncatedPostContainer1{
    background-color: red;
}
</style>
