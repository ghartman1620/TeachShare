<template>
<div>
<router-view/>
<side-bar collapsedString="Search">
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
    
        <b-form-group label="Grade level of lesson">
            <b-form-select v-model="grade" @change="loadStandards" :options="gradeOptions" class="mb-3" />
        </b-form-group>
        <b-form-group 
            label="Length of the lesson"
            description="Minutes">
            <b-form-input v-model="length"
                type="number"/>
        </b-form-group>
        <b-form-group
            label="Subject area of lesson">
            <b-form-select v-model="subject" @change="loadStandards" :options="subjectOptions" class="mb-3" />
        </b-form-group>
        <b-form-group
            label="Content type of lesson">
            <b-form-select v-model="contentType" :options="contentTypeOptions" class="mb-3" />
        </b-form-group>

        <b-form-group
            label="Standards you're looking for"
            description="use Ctrl+Click to select multiple">
            <b-form-select multiple v-model="standards" :select-size="15" :options="standardOptions" class="mb-3">
            </b-form-select>
        </b-form-group>
        

        <b-button 
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

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Watch, Prop } from 'vue-property-decorator'
import Post from "./Post.vue";
import SideBar from "./SideBar.vue";
//these also have "anY" objects prepended to them in mounted()
import api from "../api";
import {gradeOptions, subjectOptions, contentTypeOptions} from "../superTagOptions";


interface SearchQueryString {
    term: string;
    exclude: string;
    sort: string;
    in: string;
    termtype: string;
    excludetype: string;
    standards: string;
    grade: number;
    length: number;
    content_type: number;
}


@Component({
    name: "post-feed",
    components: { Post, SideBar },
})
export default class PostFeed extends Vue {

    keywords: string = "";
    searchIn: Array<string> = ["title", "content", "tags"];
    excluding: string = "";
    sortBy: string = "date";
    termtype: string = "or";
    excludetype: string = "or";
    grade: number | null = null;
    subject: number | null = null;
    contentType: number | null= null;
    length = "";
    standards: number[] = [];

    gradeOptions: any = gradeOptions;
    subjectOptions: any = subjectOptions;
    standardOptions: any = [];
    contentTypeOptions: any = contentTypeOptions;

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
        return this.$store.getters.getPosts();
    }
    get keywordRules() {
        return this.excluding.length ? "" : "required";
    }
    get excludingRules() {
        return this.keywords.length ? "required" : ""
    }
    getPosts() {
        this.$store.dispatch("fetchAllPosts");
    }
    //it seems like the v-model tag doesn't set this.grade until after the request
    //has been sent - so we'll give it a few moments to notice we've made a change
    //before we send the request to update standards.
    loadStandards() {
       
        window.setTimeout(this.loadStandardsHelp,5);
    }
    loadStandardsHelp() {
        if(this.subject != null && this.grade !== null){
            this.standardOptions = [];   
            var vm: PostFeed = this;
            console.log("in loadstandards" + this.grade);
            console.log(this.standardOptions);
            api.get(`/standards/?grade=${this.grade}&subject=${this.subject}`).then(function(response: any) {
                console.log(response.data);
                console.log(vm.standardOptions);
                for(var std of <any[]>response.data){
                    vm.standardOptions.push({
                        value: std.pk,
                        text: std.name + " (" + std.code +")",
                    })
                }
                console.log(vm.standardOptions);
                console.log(vm.grade);
            })
            console.log(this.grade);
        }
    }
    scroll() {
        var offset =
            document.documentElement.scrollTop + window.innerHeight;
        var height = document.documentElement.offsetHeight;

        if (offset >= height) {
            // this.getPosts();
        }
    }
    reloadPosts(){
        if(this.$route.query != {}){
            console.log("here");
            
            this.$store.dispatch("postSearch", this.$route.query);
        }
        else{
            console.log("fetching all posts");
            this.$store.dispatch("fetchAllPosts");
        }
    }

    advancedSearch() {
        var query: any = {}
        query.sort = this.sortBy;

        if (this.keywords !== ""){
            query.term = this.keywords;
            query.termtype = this.termtype;

        }
        if (this.excluding !== ""){
            query.exclude = this.excluding;
            query.excludetype = this.excludetype;
        }
        
        if(this.keywords !== "" || this.excluding !== ""){
            var searchParam = "";
            this.searchIn.forEach(function(element){
                searchParam += element + " ";
            })
            query.in = searchParam;
        }
        
        if(this.contentType !== null){
            query.content_type = this.contentType.toString();
        }
        
        if(this.length !== ""){
            query.length = this.length;
        }
        if(this.standards !== []){
            var searchParam = "";
            this.standards.forEach(function(element){
                searchParam += element + " ";
            })
            query.standards = searchParam;
        }
        else{
            if(this.grade !== null){
            query.grade = this.grade.toString();
            }
            if(this.subject !== null){
                query.subject = this.subject.toString();
            }
        }
        
        this.$router.push({name: "dashboard", query: query});
    }

    beforeMount(){
        console.log("in beforemount");
        console.log(this.$route.query);
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
    mounted() {
        this.gradeOptions.unshift({value: null, text: "Any Grade"})
        this.subjectOptions.unshift({value: null, text: "Any Subject"})
        this.contentTypeOptions.unshift({value: null, text: "Any Content Type"})
    }
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
