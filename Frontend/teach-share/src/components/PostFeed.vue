<template>
<base-page>
<span slot="body">
    <br>


<div v-for="(post,index) in posts">
    <div :id="index" :style="getPostContainerStyle(index)" class="container card">
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
<button @click="getPosts">See More Posts</button>
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
    overflow: "hidden",
    zIndex:"2",
    right:"0", 
    bottom:"0", 
    left:"0",
    height:"200px",
    background: "linear-gradient(to bottom,  rgba(255,255,255,0) 70%,rgba(50,50,50, .9) 95%)"
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
        /*isTruncated(index){
            console.log("istruncated" + index);
            return document.getElementById(index).offsetHeight >= 400;
        },*/
        getPosts: function() {
            this.$store.dispatch("addMorePosts");
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
    created () { // would work in 'ready', 'attached', etc.
        window.addEventListener('load', () => {

        })
    }   

}

</script>

<style lang="scss" scoped>

.truncatedPostComponent {
    overflow: hidden;
}

#seeMore {
    z-index: 3;
    width: 100%;
    text-align: center;
    visibility: visible;
}
#seeMore:hover {
    background-color: gray;
}

</style>
