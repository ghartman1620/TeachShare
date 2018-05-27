<template>
<div>
    <!-- @TODO (although this is more a sidebar thign i put it here for visibility) 
    fix an issue where the scroll bar doesn't show if the bottom of the sidebar is underneath the bottom
    of the navbar on the bottom of post create -->
    <side-bar collapsedString="Your posts">
        <div v-for="post in userPosts">
            <a href="#" v-on:click.stop="editPost(post)">
                {{post.title}}
            </a>
        </div>
    </side-bar>
    <div v-if="currentPage===1">
        <div v-if="inProgressPost !== undefined && inProgressPost.status !== LOADING" :style="getBodyStyle()">
            <div class="col-sm-12 col-lg-10 col-md-12 card card-outline-danger container icon-card-container">
                <div class="col-8 mx-auto card-deck" id="button-bar">

                    <h2></h2>
                    <div class="round-button" id="text-icon">
                        <router-link :to="{ name: 'edit-text', query: {index: this.maxElementIndex()}}">
                            <img src="/static/text-button.png"
                                        onmouseover="this.src='/static/text-button-hover.png'"
                                        onmouseout="this.src='/static/text-button.png'">
                        </router-link>
                    </div>
                    <h2></h2>

                    <div class="round-button" id="video-icon">
                        <router-link :to="{name: 'edit-video', query: {index: this.maxElementIndex(), videotype: 'embed'}}">
                            <img src="/static/video-button.png"
                                        onmouseover="this.src='/static/video-button-hover.png'"
                                        onmouseout="this.src='/static/video-button.png'">

                        </router-link>
                    </div>
                    <h2></h2>

                    <div class="round-button" id="audio-icon">
                        <router-link :to="{name: 'edit-audio', query: {index: this.maxElementIndex()}}">
                            <img src="/static/audio-button.png"
                                        onmouseover="this.src='/static/audio-button-hover.png'"
                                        onmouseout="this.src='/static/audio-button.png'">
                        </router-link>
                    </div>
                    <h2></h2>
                    <div class="round-button" id="table-icon">
                        <router-link :to="{name: 'edit-table', query: {index: this.maxElementIndex()}}">
                            <img src="/static/table-button.png"
                                        onmouseover="this.src='/static/table-button-hover.png'"
                                        onmouseout="this.src='/static/table-button.png'">
                        </router-link>
                    </div>
                    <h2></h2>
                    <div class="round-button" id="image-icon">
                        <router-link :to="{name: 'edit-image', query: {index: this.maxElementIndex()}}">
                            <img src="/static/image-button.png" >
                        </router-link>
                    </div>

                    <div class="round-button" id="file-icon">
                        <router-link :to="{name: 'edit-file', query: {index: this.maxElementIndex()}}">
                            <img src="/static/file-button.png"
                                        onmouseover="this.src='/static/file-button-hover.png'"
                                        onmouseout="this.src='/static/file-button.png'">
                        </router-link>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-2"></div>
                <div class="col-8">
                    <div class="form-group">
                        <div class="card" id="title-tag-card">
                            <br>
                            <div class="title-container container">
                                <div class="row">
                                    <div class="col-2">
                                        <label for="titleTextbox"><h4><strong>Title: </strong></h4></label>
                                    </div>

                                    <div class="col-10">
                                    
                                        <input class="form-control" type="text" v-model="inProgressPost.title"
                                            placeholder="Title required" id="titleTextbox">
                                    </div>
                                </div>
                            </div>
                            <div class="container tag-card card">
                                <div class="row">
                                    <div class="col-2">
                                        <label for="tagTextbox"><h4><strong>Tags: </strong></h4></label>
                                    </div>
                                    <div class="col-8">
                                        <input class="form-control" v-model="inProgressTag" v-on:keyup="createTagEvent"
                                            placeholder="add a topic tag" id="tagTextbox">
                                    </div>
                                    <div class="col-2">
                                        <button @click="createTagBtn" id="create-tag-button" class="btn btn-block btn-primary">
                                            <span>
                                                <font-awesome-icon icon="plus"></font-awesome-icon>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <hr>
                                <span :key="index" v-for="(tag,index) in inProgressPost.tags">
                                    <span @click="removeTag(index)" class="tag-entry badge badge-dark">{{tag}} <span aria-hidden="true">&times;</span>
                                        <!-- <button id="tag-delete-button" type="button" class="btn btn-sm btn-dark" >{{"x"}}</button> -->
                                    </span>
                                </span>
                                <hr>
                                 <div v-if="inProgressPost.original_user" style="text-align: center;">
                                    This post was derived from a post authored by {{inProgressPost.original_user}}
                                </div>
                                <router-link :to="{name: 'permission-add'}">
                                    Share
                                </router-link>
                            </div>
                            <div class="card background">
                            <div class="row">
                            <div class="col-2">
                                <label for="tagTextbox"><h4><strong>Post Color: </strong></h4></label>
                            </div>
                            <div class="col-10">
                                <span class="dot" style="background-color: #ffafc5;" @click= "changeColor('#ffafc5')"></span>
                                <span class="dot" style="background-color: #ee6055;" @click= "changeColor('#ee6055')"></span>
                                <span class="dot" style="background-color: #f2c078;" @click= "changeColor('#f2c078')"></span>
                                <span class="dot" style="background-color: #96e6b3;" @click= "changeColor('#96e6b3')"></span>
                                <span class="dot" style="background-color: #7797ff;" @click= "changeColor('#7797ff')"></span>
                                <span class="dot" style="background-color: #7b4b94;" @click= "changeColor('#7b4b94')"></span>
                                <span class="dot" style="background-color: #d2ab99;" @click= "changeColor('#d2ab99')"></span>
                                <span class="dot" style="background-color: #0e3b43;" @click= "changeColor('#0e3b43')"></span>
                                <span class="dot" style="background-color: #775253;" @click= "changeColor('#775253')"></span>
                                <span class="dot" style="background-color: #c9cebd;" @click= "changeColor('#c9cebd')"></span> 
                            </div>
                        </div>
                    </div>

                        </div>
                        <br>
                        <br>
                        <br>
                        <drag-and-drop v-if="currentPost.elements.length > 0" :key=nextStateId>
                        </drag-and-drop>
                        <br>
                        <br>
                        <br>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <h1>
                Loading post...
            </h1>
            <font-awesome-icon icon="spinner" spin></font-awesome-icon>
        </div>
    </div>
    <div v-else-if="currentPage===2">
        <tag-select :post="currentPost">

        </tag-select>
    </div>

    <br><br><br> <!-- this is so problems don't occur with bottom of page button presses -->
    <nav class="navbar fixed-bottom navbar-light navbar-left bottom-navbar bg-light">
        <div id="bottomNavTitle" class="title" v-if="inProgressPost.title != ''">{{inProgressPost.title}}</div>
        <div class="title title-placeholder" v-else></div>
    </nav>


    <nav class="navbar fixed-bottom justify-content-end bg-transparent">
        <div v-if="postStatus === SAVING">
            Saving...
            <font-awesome-icon icon="spinner" spin></font-awesome-icon>
        </div>
        <div v-else-if="postStatus === SAVED">
            Saved!
        </div>
        <b-pagination size="md" :per-page="10" v-model="currentPage">

        </b-pagination>
        <button type="button" class="undo-button align-right btn btn-sm btn-outline-danger btn-primary-spacing" @click="undo">
            <font-awesome-icon icon="undo" fixed-width></font-awesome-icon> undo 
        </button>
        <button type="button" class="redo-button align-right btn btn-sm btn-outline-success btn-primary-spacing" @click="redo">
            <font-awesome-icon icon="redo" fixed-width></font-awesome-icon> redo 
        </button>
        <button type="button" class="submit-button btn btn-primary" v-on:click="submitPost">
            <font-awesome-icon icon="check" fixed-width></font-awesome-icon> Publish post
        </button>
    </nav>


<div :style="getEditorStyle()">
    <div class="row">
        <div class="col-12">
            <router-view/>
        </div>
    </div>
</div>

</div>
</template>


<script lang="ts">
import Vue from "vue";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";
import { mapState } from "vuex";
import forEach from "lodash/forEach";
import PostElement from "./PostElement.vue";
import {PostStatus, InProgressPost} from "../post";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import { Component, Prop } from "vue-property-decorator";
import {Location, Dictionary} from "vue-router/types/router.d";
import api from "../api";
import { addElement,
    editElement, 
    setGrade,
    beginPost, 
    getCurrentPost, 
    createPost, 
    undo, 
    redo, 
    setTags, 
    setLayout,
    setColor,
    getColor,
    getLayout,
    swapElements, 
    removeElement,
    setSubject, 
    setContentType, 
    setLength,
    saveDraft 
} from "../store_modules/PostCreateService";
import {
    getLoggedInUser,
    logout
} from "../store_modules/UserService";
import SideBar from "./SideBar.vue";
import {asLoggedIn} from "../router/index";
import TagSelect from "./TagSelect.vue";
import DragAndDrop from "./DragAndDrop.vue";
import {User} from "../models";
import * as Cookie from "tiny-cookie";


function isBlank(str) {
    return !str || /^\s*$/.test(str);
}

const editorHidden = {
    "z-index": "-1"
};
const editorVisible = {
    position: "fixed",
    width: "80%",
    left: "10%",
    "max-height": "70%",
    top: "20%",
    "z-index": "1",
    "overflow-y": "scroll",
    "overflow-x": "hidden"
};

const bodyHidden = {
    opacity: ".3",
    "pointer-events": "none",
    overflow: "hidden"
};
const bodyVisible = {
    opacity: "1"
};


@Component({
    name: "post-create",
    components: { PostElement, FontAwesomeIcon, SideBar, TagSelect, DragAndDrop }
})

export default class PostCreate extends Vue{

    get getLoggedInUser(): User {
        return getLoggedInUser(this.$store);
    }
    
    SAVING = PostStatus.Saving;
    LOADING = PostStatus.Loading;
    SAVED = PostStatus.Saved;
    title: string = ""; //@TODO: make changes to title a store mutation that is saved and can be undone/redone
    inProgressTag: string = "";
    tags: string[] = [];
    userPosts: any[] = [];
    layout: Object[] = [];

    currentPage: number = 0;

    //these aren't ever saved into InProgressPost, they're here for the purpose
    //of loading in a post's current info when you load up a post.
    
    get currentPost(): InProgressPost | undefined {
        return getCurrentPost(this.$store);
    }

    get postStatus(): PostStatus {
        return getCurrentPost(this.$store)!.status;
    }
    // getters
    get inProgressPost(): InProgressPost {
        return getCurrentPost(this.$store)!;
    }

    get storeElements() {
        return getCurrentPost(this.$store)!.elements;
    }
    get nextStateId() {
        return getCurrentPost(this.$store)!.elements.length;
    }
    get hasTitle() {
        return getCurrentPost(this.$store)!.title.length > 0;
    }

    get color() {
        if (getColor(this.$store) === null){
            console.log("getColor undefined!!!");
            return "#96e6b3";
        }
        return getColor(this.$store);
    }

    changeColor(color: string){
        setColor(this.$store, color);
    }

    saveTagChanges(grade: number, length: number, subject: number, contentType: number, standards: number[],
        concepts, practices, coreIdeas, layout): void {
        console.log(standards);
        this.inProgressPost.setStandards(standards);
        this.inProgressPost.setGrade(grade);
        this.inProgressPost.setSubject(subject);
        this.inProgressPost.setContentType(contentType);
        this.inProgressPost.setLength(length);
        this.inProgressPost.setConcepts(concepts);
        this.inProgressPost.setPractices(practices);
        this.inProgressPost.setLayout(layout);
        this.saveDraft();
    }
    
    saveDraft() {
        saveDraft(this.$store);
    }
    changeGrade(grade: number) {
        setGrade(this.$store, grade);
    }
    changeSubject(subject: number) {
        setSubject(this.$store, subject);
    }
    changeContentType(contentType: number){
        setContentType(this.$store, contentType);
    }
    changeLength(length: string) {
        setLength(this.$store, parseInt(length));
    }
    getEditorStyle() {
        this.$log(this.$route.name !== "create");
        if (this.$route.name !== "create") {
            return editorVisible;
        } else {
            return editorHidden;
        }
    }
    getBodyStyle() {
        if (this.$route.name !== "create") {
            return bodyHidden;
        } else {
            return bodyVisible;
        }
    }
    nop() {}
    removeTag(index: number) {
        //@TODO: make tag changes a store mutation that can be undone/redone
        this.tags.splice(index, 1);
        setTags(this.$store, this.tags);
    }
    createTagEvent(e: any) {
        if (e.keyCode === 13 && this.inProgressTag !== "") {
            this.createTag();
        }
    }
    createTagBtn() {
        if(this.inProgressTag !== ""){
            this.createTag();
        }
    }
    createTag() {
        this.tags.push(this.inProgressTag);
        this.inProgressTag = "";
        setTags(this.$store, this.tags);
    }
    submitPost(event: any) {
        var vm = this;
        // dispatch createPost method in the store. This will send a
        // post request to the backend server.
        createPost(this.$store).then(function(ret: any) {
            // handle the response from the server
            if (ret === undefined) {
                vm.$notifyDanger(
                    "There was a problem submitting your post."
                );
            } else if (ret.status < 300) {
                // post was successful
                vm.$notifySuccess("Post submitted successfully!");
                vm.$router.push({
                    name: "posts",
                    params: { post_id: ret.data.pk }
                });
            } else {
                let total = "";
                forEach(ret, function(val, key) {
                    let currentValue = val.join(" ");
                    total = `${total} "${key}: ${currentValue}" `;
                });
                vm.$notifyDanger(
                    `There was a problem submitting your post. ${total}`
                );
            }
        });
    }

//right now only loads one page of posts
    //@TODO: make a distinction between making potential edits to your post and publishing those edits.
    //as a teacher, I want to be able to draft edits to my lesson plan and see them before I publish those edits, even
    //if my post is already published.
    editPost(post): void {

        window.localStorage.setItem("inProgressPost", post.pk);
        var user: User = <User>this.getLoggedInUser;
        this.beginPost(<number>user.pk, <number>post.pk);
    }
    beginPost(userid: number, postid: number | undefined): void {
        beginPost(this.$store, {
            userid: <number>userid, 
            id: postid,
        });
    }
    saveLayout() {
        setLayout(this.$store, this.layout);
    }
    moveElementUp(index: number) {
        if (index != 0) {
            swapElements(this.$store, [index, index - 1]);
            // dispatch only allows one argument so we'll pass them as an array
        }
    }
    moveElementDown(index: number) {
        if (index != this.$store.state.create.post.elements.length - 1) {
            swapElements(this.$store, [index, index + 1]);
            // dispatch only allows one argument so we'll pass them as an array
        }
    }
    removeElement(index: number) {
        removeElement(this.$store, index);
    }
    maxElementIndex() {
        return getCurrentPost(this.$store)!.elements!.length;
    }
    undo() {
        undo(this.$store);
    }
    redo() {
        redo(this.$store);
    }
    async getUserPosts(){
        var vm: PostCreate = this;
        //@TODO: use store and Post model for this work
        //This is also all reloaded every time somebody reloads the page.. which is really quite no good.
        var nextPage = 1;
        do{
            var response;

            response = await asLoggedIn(api.get(`/posts/?user=${this.getLoggedInUser.pk}&page=${nextPage.toString()}`));
            for(var post of response.data.results){
                vm.userPosts.push(post);
            }
            nextPage++;
        }while(response.data.next !== null);
    }
    created() {

        console.log(this.getLoggedInUser);
        var inProgressPost = window.localStorage.getItem("inProgressPost");
        if(inProgressPost == undefined){
            this.beginPost( 
                //???? how on earth is this type string | undefined
                //It's definitely just a number. Look at user.ts.
                <number>this.getLoggedInUser.pk,
                undefined);
        }
        else{
            this.beginPost(
                <number>this.getLoggedInUser.pk, parseInt(<string>inProgressPost));
        }
        this.getUserPosts();
    }

    mounted() {
        console.log("New layout: ", this.layout);
        console.log("mounted post create");
        var vm: PostCreate = this;
        console.log("Post color: ", this.color);
        this.$on("submitElement", function(element: any, index: number){

            if(index == getCurrentPost(vm.$store)!.elements.length){
                addElement(vm.$store, element);
            }
            else{
                editElement(vm.$store, {element: element, index: index});
            }
            vm.$router.push({name: "create"});
        })

        this.$on("submitTagChanges", this.saveTagChanges)
    }

};
</script>


<style lang="scss" scoped>
$background-color: #e5ffee;
$title-tag-card-background: darken(#bececa, 5%);
$dark-green: #3b896a;
$card-shadow: 4px 8px 8px -1px rgba(0, 0, 0, 0.4);

.tag-entry {
    font-size: 12pt;
    margin: 8px;
}

.tag-entry:hover {
    background-color: darken(gray, 10%);
    cursor: pointer;
}

.round-button {
    max-width: 100px;
    max-height: 100px;
    padding-bottom: 11%;
    border-radius: 50%;
    border: 0 solid #f5f5f5;
    overflow: hidden;
    background: $title-tag-card-background;
    box-shadow: 1 1 4px gray;
}

#button-bar {
    min-width: 665px;
    max-height: 240px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 1px;
    padding-right: 1px;
    border-radius: 60px;
    background: $title-tag-card-background;
    justify-content: center;
    box-shadow: $card-shadow;
}

#text-icon {
    margin-right: 0.2rem;
}

#audio-icon {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}
#video-icon {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}
#image-icon {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}
#file-icon {
    margin-left: 0.2rem;
}
#text-icon:hover {
    background: #bf8301;
}
#video-icon:hover {
    background: #ad5c00;
}
#audio-icon:hover {
    background: #3b685b;
}
#image-icon:hover {
    background: #13213f;
}
#file-icon:hover {
    background: #1a3c68;
}

#title-tag-card {
    background-color: $title-tag-card-background;
    margin-top: 2rem;
    border: none;
    box-shadow: $card-shadow;
}

#tag-submit-box {
    margin-bottom: 10px;
}

#tag-delete-button {
    margin-bottom: 5px;
}

#up-button {
    margin-top: 10px;
    margin-left: 1rem;
    background-color: $dark-green;
}

#up-button:hover {
    background-color: darken($dark-green, 10%);
}

#down-button {
    margin-top: 10px;
    margin-left: 6px;
    background-color: $dark-green;
}

#down-button:hover {
    background-color: darken($dark-green, 10%);
}

#garbage-button {
    margin-left: 10px;
    margin-top: 10px;
    // margin-right: 1rem;
    float: right;
}

#edit-button {
    margin-top: 10px;
    float: right;
}

.dot {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    display: inline-block;
}


.round-button img {
    display: block;
    width: 100%;
    padding: 0%;
    height: auto;
}

.foreground {
    position: fixed;
    left: 20%;
    top: 20%;
    width: 80%;
    margin: auto;
    z-index: 2;
    opacity: 1;
}

.postheader {
    height: 30px;
    width: 100%;
}

/* Submitted elements now being viewed */
.container-element {
    width: 60%;
    height: 300px;
}

.icon-card-container {
    background-color: #e5ffee;
    border: 0;
}

.card {
    background-color: #e5ffee;
    position: relative;
}

.title {
    font-size: 1.5rem;
}

.title-placeholder {
    opacity: 0.5;
}

.undo-button {
    margin-right: 1rem;
}

.redo-button {
    margin-right: 1rem;
}

.tag-card {
    background-color: $title-tag-card-background;
    border: 0;
    display: inline;
    padding: 10px;
}

.post-element,
card-row {
    background-color: $title-tag-card-background;
}

.title-container {
    width: 100%;
}

.bottom-navbar {
    height: 50px;
    background-color: lighten(
        rgba($title-tag-card-background, 0.9),
        15%
    ) !important;
    border-top: 1px solid darken($title-tag-card-background, 10%);
}
</style>
