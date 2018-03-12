<template>
<div>
<router-view/>
<side-bar>
    <b-form :class="{'control' : true}" style="padding: 8px;" v-on:submit.prevent="advancedSearch()">

        <b-form-group label="Search for posts with:">
            <b-form-radio-group v-model="termtype" :options="termTypeOptions"/>
            <b-form-input 
                type="text" 
                name="keywords"
                v-validate="keywordRules" 
                :class="{'input': true, 'is-danger': errors.has('keywords') }" 
                v-model="keywords" 
                placeholder="Keyword(s)"
            />
            
        </b-form-group>
        <b-form-group label="In:">
            <b-form-checkbox-group stacked v-model="searchIn" :options="searchInOptions"/>
        </b-form-group>
        <b-form-group label="Excluding posts with:">
            <b-form-radio-group v-model="excludetype" :options="termTypeOptions"/>

            <b-form-input 
                type="text" 
                name="excluding"
                v-validate="keywordRules" 
                :class="{'input': true, 'is-danger': errors.has('excluding') }" 
                v-model="excluding" 
                placeholder="Keyword(s)"
            />
        </b-form-group>

        
        <b-form-group label="Sort by:">
            <b-form-radio-group stacked v-model="sortBy" :options="sortByOptions"/>
        </b-form-group>
    
        <!--<b-btn v-b-toggle.gradeCollapse variant="primary">Toggle Grades</b-btn>

        <b-collapse id="gradeCollapse" class="mt-2">
            <b-form-group label="Grades">

                <b-form-checkbox-group stacked v-model="grades" :options="gradeOptions"/>
                
            </b-form-group>
        </b-collapse>-->


        
        <span v-show="errors.has('keywords') && errors.has('excluding')" class="help is-danger">
            You must filter by some keyword(s).
        </span>

        <b-button 
            :disabled="errors.has('keywords') && errors.has('excluding')"
            type="submit" 
            variant="primary" 
            class="sidebar-btn">
            Submit
        </b-button>


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
            searchIn: ["title", "content", "tags"],
            excluding: "",
            sortBy: "date",
            termtype: "or",
            excludetype: "or",
            grades: [],
            gradeOptions: [
                {text: "K", value: 0},
                {text: "1", value: 1},
                {text: "2", value: 2},
                {text: "3", value: 3},
                {text: "4", value: 4},
                {text: "5", value: 5},
                {text: "6", value: 6},
                {text: "7", value: 7},
                {text: "8", value: 8},
                {text: "9", value: 9},
                {text: "10", value: 10},
                {text: "11", value: 11},
                {text: "12", value: 12},
                   
            ],
            termTypeOptions: [
                {text: "Any terms", value: "or"},
                {text: "All terms", value: "and"},
            ],
            
            searchInOptions: [
                {text: "Title", value: "title"},
                {text: "Content", value: "content"},
                {text: "File names", value: "filenames"},
                {text: "Tags", value: "tags"}
            ],
            sortByOptions: [
                {text: "Date", value: "date"},
                {text: "Relevance", value: "score"},
                //TODO
                //{text: "Likes", value: "likes"},
            ]
        
        }
    },
    computed: {
        posts: function() {
            return this.$store.getters.getPosts();
        },
        keywordRules() {
            return this.excluding.length ? "" : "required";
        },
        excludingRules() {
            return this.keywords.length ? "required" : ""
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
                //this.getPosts();
            }        
        },
        reloadPosts(){
            if(this.$route.query.term != undefined){
                console.log("here");
                this.$store.dispatch("postSearch", this.$route.query);
            }
            else{
                this.$store.dispatch("fetchAllPosts");
            }
        },
        advancedSearch() {
            
            var query = {};
            if(this.keywords != ""){
                query.term = this.keywords;
            }
            if(this.excluding != ""){
                query.exclude = this.excluding;
            }
            query.sort = this.sortBy;
            var searchParam = "";
            this.searchIn.forEach(function(element){
                searchParam += element + " ";
            })
            console.log(searchParam);
            query.in = searchParam;
            query.termtype = this.termtype;
            query.excludetype = this.excludetype;
            this.$router.push({name: "dashboard", query: query});
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
    },
    mounted() {},
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
