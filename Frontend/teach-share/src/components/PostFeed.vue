<template>
<div>
<router-view/>
<side-bar>
    <b-form style="padding: 8px;" v-on:submit.prevent="advancedSearch()">
        <b-form-group label="Search for posts with:">
            <b-form-input type="text" v-model="keywords" placeholder="Keyword(s)"/>
            
        </b-form-group>
        <b-form-group label="In:">
            <b-form-checkbox-group stacked v-model="searchIn" :options="searchInOptions"/>
        </b-form-group>
        <b-form-group label="Excluding posts with:">
            <b-form-input type="text" v-model="exclude" placeholder="Keyword(s)"/>
        </b-form-group>
        
        <b-form-group label="Sort by:">
            <b-form-radio-group stacked v-model="sortBy" :options="sortByOptions"/>
            
        </b-form-group>
        
        

        <b-button type="submit" class="sidebar-btn">Submit</b-button>
    </b-form>
</side-bar>



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
import SideBar from "./SideBar.vue";


export default {
    name: "PostFeed",
    components: { Post, SideBar },
    data: function() {
        return {
            keywords: "",
            searchIn: [],
            excluding: "",
            sortBy: "",
            searchInOptions: [
                {text: "Title", value: "title"},
                {text: "Content", value: "content"},
                {text: "File names", value: "filenames"},
                {text: "Tags", value: "tags"}
            ],
            sortByOptions: [
                {text: "Date", value: "date"},
                {text: "Relevance", value: "score"},
                
            ]
        
        }
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
        },
        advancedSearch() {
            
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


.sidebar {
    position: fixed;
    z-index: 2;
    left: 0;
    top: 51px; /* height of navbar*/
    height: 100%;
    background-color: white;    
}
.sidebar-collapsed {
    width: 5%;
}
.collapsing {
    position: relative;
    width: 0;
    height: auto;
    overflow: hidden;
    -webkit-transition-duration: 0.35s;
    transition-duration: 0.35s;
    -webkit-transition-timing-function: ease;
    transition-timing-function: ease;
    -webkit-transition-property: width, visibility;
    transition-property: width, visibility;
    
}

</style>
