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
            <post-comp
                :maxHeight="500"
                :post="castPost(post)"
                :index="index">
            </post-comp>
        </div>
    </div>
    <br><br> 
</div> 

<!-- Scroll to bottom functionality -->

<br><br><!-- this br is required so scroll() can function properly-->
<button class="invisible-button"></button>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Watch, Prop } from 'vue-property-decorator'
import PostComp from "./Post.vue";
import SideBar from "./SideBar.vue";
import { Post } from "../models";
import { fetchAllPosts, postSearch, getPosts } from "../store_modules/PostService";

interface SearchQueryString {
    term: string
    exclude: string
    sort: string
    in: string
    termtype: string
    excludetype: string
}

@Component({
    name: "post-feed",
    components: { PostComp, SideBar },
})
export default class PostFeed extends Vue {

    keywords: string = "";
    searchIn: Array<string> = ["title", "content", "tags"];
    excluding: string = "";
    sortBy: string = "date";
    termtype: string = "or";
    excludetype: string = "or";
    grades: string[] = [];
    gradeOptions: object[] = [
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
        {text: "12", value: 12}
    ];
    termTypeOptions: object[] = [
        {text: "Any terms", value: "or"},
        {text: "All terms", value: "and"}
    ];
    searchInOptions: object[] = [
        {text: "Title", value: "title"},
        {text: "Content", value: "content"},
        {text: "File names", value: "filenames"},
        {text: "Tags", value: "tags"}
    ];
    sortByOptions: object[] = [
        {text: "Date", value: "date"},
        {text: "Relevance", value: "score"}
        // {text: "Likes", value: "likes"},
    ];

    get posts() {
        return getPosts(this.$store);
    }
    get keywordRules() {
        return this.excluding.length ? "" : "required";
    }
    get excludingRules() {
        return this.keywords.length ? "required" : ""
    }
    getPosts() {
        const p = fetchAllPosts(this.$store);
        p.then((res) => { 
            console.log("blah...");
            console.log("***********", res);
        });
    }
    scroll() {
        var offset =
            document.documentElement.scrollTop + window.innerHeight;
        var height = document.documentElement.offsetHeight;

        if (offset >= height) {
            // this.getPosts();
        }
    }
    reloadPosts() {
        if(this.$route.query.term != undefined){
            console.log("here");
            postSearch(this.$store, this.$route.query);
        }
        else{
            const p = fetchAllPosts(this.$store);
            p.then((res) => { 
                console.log("blah...");
                console.log("***********", (res as Post));
            });
        }
    }

    castPost(p: object): Post {
        return p as Post;
    }

    advancedSearch() {
        var query = {
            term: "",
            exclude: "",
            sort: "",
            in: "",
            termtype: "",
            excludetype: ""
        };

        if (this.keywords != ""){
            query.term = this.keywords;
        }
        if (this.excluding != ""){
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
    }
    mounted() {}
    destroyed() {
        // this doesn't work: because t is not defined.
        // window.removeEventListener("scroll", function() {t.scroll()}, false);
    }
    @Watch("$route")
    onRouteChange(to: any, from: any) {
        this.reloadPosts();
    }
}
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
