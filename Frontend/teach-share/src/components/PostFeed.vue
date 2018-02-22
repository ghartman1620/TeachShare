<template>
<body>
<router-view/>
    <br>


<div v-for="(post,index) in posts">
    <div :id="index" :style="getPostContainerStyle(index)" class="container card">
        <h3>{{post.title}}</h3>
        <div class="truncatedPostComponent">
        <div v-for="component in post.content">
            
            <post-element :component="component"></post-element>
        </div>
        </div>
        <div :style="getGradientStyle(index)"></div>
        <p v-if="!isSmall(index)" id="seeMore" @click="expandPost(index)" v-html="seeMoreString(index)"></p>
    </div>
       
</div>
<br><br><!-- this br is required so scroll() can function properly-->
<button @click="getPosts"></button>
</body>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import PostElement from './PostElement';
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
            posts: [],
            expandedPosts: [],
            smallPosts: [],
        }
    },
    computed: { 

    },
    methods: {
        isSmall(index){

            return this.smallPosts.includes(index);
        },
        getPostContainerStyle(index){     
            if(this.expandedPosts.includes(index) || this.smallPosts.includes(index)){
                return postContainerExpanded;
            }
            else{
                return postContainerDefault;
            }
        },
        getGradientStyle(index) {
            if(this.expandedPosts.includes(index) || this.smallPosts.includes(index)){
                return gradientExpanded;
            }
            else{
                return gradientDefault;
            }
        },

        getPosts: function() {
            this.$store.dispatch("addMorePosts");
        },

        expandPost(index){
            for(var i = 0; i < this.expandedPosts.length; i++){
                if(this.expandedPosts[i] == index){
                    this.expandedPosts.splice(i, 1);
                    window.scrollTo(0, document.getElementById(index).offsetTop-55);
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
        },
        scroll(){
            var offset = document.documentElement.scrollTop + window.innerHeight;
            var height = document.documentElement.offsetHeight;

            if (offset >= height) {
                console.log("scroll to bototm");
                this.getPosts();

            }        
        },
        checkHeights(){
            
            for(var i = 0; i < this.posts.length; i++){
                var ele = document.getElementById(i.toString());
                if(ele.offsetHeight <= 390){
                    this.smallPosts.push(i);
                }
            }

        }
    },
    beforeMount(){
        this.getPosts();
        //this isn't accessible in an anonymous function,
        //so we'll make it a variable so we can call scroll() 
        var t = this;
        window.addEventListener('scroll', function() {t.scroll()}, false);
    },
    mounted() {
        this.$store.watch(this.$store.getters.getPosts, posts => {
            console.log("posts changed");
            this.posts = posts;
           


            //So with this watch function waiting until posts is updated,
            //you'd think that it could also render the page so that we can
            //determine the height of all of the post containers and 
            //remove the gradient appropriately.

            //You'd THINK that.

            //But you'd think wrong. So I had to write this nonsense.
            var t = this;
            //this.checkHeights();
            setTimeout(function(){t.checkHeights()}, 0);
        });
    },
    destroyed() {
        window.removeEventListener('scroll', function() {t.scroll()}, false);
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
