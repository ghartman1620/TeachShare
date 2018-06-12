<template>
<div>
    
    <side-bar collapsedString="Your posts">

        <div v-for="post in userPosts">
            <a href="#" v-on:click.stop="editPost(post)">
                <span :key="post.title" v-if="post.title != ''">
                    {{post.title}}
                </span>
                <span v-else>
                    Untitled Post
                </span>
                <span v-if="Number(post.user.pk) !== Number(getLoggedInUser.pk)">
                    (Shared)
                </span>
                <span v-if="post.pk === inProgressPost.pk">
                    (Open)
                </span>
            </a>
        </div>
    </side-bar>
    <div v-if="currentPage===1">
       

        <div v-if="this.createState.post !== undefined && this.postStatus !== this.LOADING" :style="getBodyStyle()">
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
                                    
                                        <input class="form-control" type="text" @change="changeTitle" v-model="inProgressPost.title"
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
                            <!-- <b-dropdown class="m-md-2">
                                <b-dropdown-item>-->
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
                                <!-- </b-dropdown-item>
                            </b-dropdown> -->
                        </div>
                    </div>

                        </div>
                        <br>
                        <br>
                        <br>
                        <drag-and-drop v-if="currentPost.elements.length > 0" :key="changeDragAndDrop">
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
        <div id="bottomNavTitle" class="title" v-if="postStatus !== LOADING && inProgressPost.title != ''">{{inProgressPost.title}}</div>
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
        <b-pagination class="pull-left" size="md" :per-page="10" v-model="currentPage">

        </b-pagination>
        <button type="button" class="undo-button align-right btn btn-sm btn-outline-danger btn-primary-spacing" @click="undo">
            <font-awesome-icon icon="undo" fixed-width></font-awesome-icon> undo 
        </button>
        <button type="button" class="redo-button align-right btn btn-sm btn-outline-success btn-primary-spacing" @click="redo">
            <font-awesome-icon icon="redo" fixed-width></font-awesome-icon> redo 
        </button>
        <button type="button" class="btn-sm submit-button btn btn-primary" v-on:click="submitPost">
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
import isEqual from "lodash/isEqual";

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
    saveDraft, 
} from "../store_modules/PostCreateService";
import {fetchPostSubscribe, getPosts} from "../store_modules/PostService";
import {
    getLoggedInUser,
    logout
} from "../store_modules/UserService";
import SideBar from "./SideBar.vue";
import {asLoggedIn} from "../router/index";
import TagSelect from "./TagSelect.vue";
import DragAndDrop from "./DragAndDrop.vue";
import {User, Post, ILayout} from "../models";
import * as Cookie from "tiny-cookie";
import WebSocket from "../WebSocket";
import { debug } from 'util';



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
export default class PostCreate extends Vue {
    @State( (state) => state.create) createState;
    get getLoggedInUser(): User {
        return getLoggedInUser(this.$store);
    }

    SAVING = PostStatus.Saving;
    LOADING = PostStatus.Loading;
    SAVED = PostStatus.Saved;

    public postStatus: PostStatus = this.LOADING;
    public thisUserPosts: number[] = [];

    public title: string = ""; // @TODO: make changes to title a store mutation that is saved and can be undone/redone
    public inProgressTag: string = "";
    public tags: string[] = [];
    public layout: ILayout[] = [];
    // this is a key for the drag and dropped, for the purpose of re-mounting the drag and drop component
    // if layout is changed by the websocket 
    public changeDragAndDrop: number = 0;
    // userPosts: any[] = [];

    public currentPage: number = 0;

    // these aren't ever saved into InProgressPost, they're here for the purpose
    // of loading in a post's current info when you load up a post.

    get userPosts(): Post[] {
        const store = this.$store;
        const userPosts = getPosts(this.$store).filter( (p) => {
            return this.thisUserPosts.includes(p.pk);
        });
        // console.log("user posts in post create: ", userPosts)
        return userPosts;
    }
    get currentPost(): InProgressPost | undefined {
        return getCurrentPost(this.$store);
    }


    // getters
    get inProgressPost(): InProgressPost | undefined {
        return this.createState.post;
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
            return "#96e6b3";
        }
        return getColor(this.$store);
    }

    public changeColor(color: string){
        setColor(this.$store, color);
    }

    public saveTagChanges(grade: number, length: number, subject: number, contentType: number, standards: number[],
            concepts, practices, coreIdeas, layout): void {
        if (this.inProgressPost !== undefined) {
            this.inProgressPost.setStandards(standards);
            this.inProgressPost.setGrade(grade);
            this.inProgressPost.setSubject(subject);
            this.inProgressPost.setContentType(contentType);
            this.inProgressPost.setLength(length);
            this.inProgressPost.setConcepts(concepts);
            this.inProgressPost.setPractices(practices);
            this.inProgressPost.setLayout(layout);
            this.saveDraft();
        } else {
            console.error("Error: saveTagChanges() called when inprogresspost does not exist");
        }
    }
    public saveDraft() {
        saveDraft(this.$store);
    }
    public changeGrade(grade: number) {
        setGrade(this.$store, grade);
    }
    public changeSubject(subject: number) {
        setSubject(this.$store, subject);
    }
    public changeContentType(contentType: number) {
        setContentType(this.$store, contentType);
    }
    public changeLength(length: string) {
        setLength(this.$store, parseInt(length));
    }
    public getEditorStyle() {
        if (this.$route.name !== "create") {
            return editorVisible;
        } else {
            return editorHidden;
        }
    }
    public getBodyStyle() {
        if (this.$route.name !== "create") {
            return bodyHidden;
        } else {
            return bodyVisible;
        }
    }
    public nop() {}
    public removeTag(index: number) {
        // @TODO: make tag changes a store mutation that can be undone/redone
        this.tags.splice(index, 1);
        setTags(this.$store, this.tags);
    }
    public createTagEvent(e: any) {
        if (e.keyCode === 13 && this.inProgressTag !== "") {
            this.createTag();
        }
    }
    public createTagBtn() {
        if (this.inProgressTag !== "") {
            this.createTag();
        }
    }
    public changeTitle() {
        console.log("change title called!");
        this.inProgressPost!.saveDraft();
    }
    public createTag() {
        this.tags.push(this.inProgressTag);
        this.inProgressTag = "";
        setTags(this.$store, this.tags);
    }
    public submitPost(event: any) {
        const vm = this;
        // dispatch createPost method in the store. This will send a
        // post request to the backend server.
        createPost(this.$store).then( (ret: any) => {
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
                forEach(ret, (val, key) => {
                    const currentValue = val.join(" ");
                    total = `${total} "${key}: ${currentValue}" `;
                });
                vm.$notifyDanger(
                    `There was a problem submitting your post. ${total}`
                );
            }
        });
    }
    public openEditor(index: number) {
        const type = getCurrentPost(this.$store)!.elements[index].type;
        let routeName = "edit-";
        if (type === "text") {
            routeName += "text";
        } else if (type === "audio") {
            routeName += "audio";
        } else if (type === "video_file" || type === "video_link") {
            routeName += "video";
        } else if (type === "image_file") {
            routeName += "image";
        } else {
            routeName += "file";
        }
        const query: Dictionary<string> = { index : index.toString() };
        const loc: Location = {name: routeName, query};
        this.$router.push(loc);
    }
    // right now only loads one page of posts
    // @TODO: make a distinction between making potential edits to your post and publishing those edits.
    // as a teacher, I want to be able to draft edits to my lesson plan and see them before I publish those edits, even
    // if my post is already published.
    public editPost(post): void {

        window.localStorage.setItem("inProgressPost", post.pk);
        const user: User = this.getLoggedInUser as  User;
        console.log("beginning post with post ");
        console.log(post.pk);
        this.beginPost(user.pk as number, post.pk as number);
    }
    public beginPost(userid: number, postid: number | undefined): void {
        console.log("Beginning the post again");
        let vm: PostCreate = this;
        if (postid !== undefined) {
            // So the user fires up post create and wants some posts. We have a few cases.

            // One: they've got no inProgressPost item. Most probably they've just logged in.

            // In this case, currently (absolutely subject to change and i'll detail a better approach
            // in just a moment) we'll kindly make them a post and then load that up into their db and 
            // go ahead and subscribe to it. They'll get stuck on loading until the subscription is done
            // and they get the get message from the websocket.

            // Two: they do have an inProgressPost item. Awesome! Maybe they revisited the page (welcome back)
            // or maybe they just clicked on another one of their posts to go edit it.

            // In this case, we sort of expect that these fetch posts will hit their local cache (if not that's ok)
            // But we'll begin post - either here or in the handler down in mounted() with the post with all
            // the goodies they have saved in it from last time.


            // (as far as a better approach to the first case goes - we shouldn't create a new post until they
            // make some database-savable changes to their post. That way if they just hit reload repeatedly like
            // i'm doing now to test things they won't make a bunch of new posts that are all empty.)
            window.localStorage.setItem("inProgressPost", postid.toString());
            console.log("fetching post " + postid);
            fetchPostSubscribe(this.$store, postid).then((p) => {
                if(p) {
                    console.log("begin post")
                    console.log(p);
                    beginPost(vm.$store, {userid: getLoggedInUser(vm.$store).pk, p:p});
                    this.postStatus = this.SAVED;
                }
            });
        } else {
            console.log("Before request");
            //this is a little bit silly currently - use the api to create a post, then
            // use websockets to subscribe to it. I know there's a create message in the works
            // but last I heard of it was a brief slack consultation about the current
            // db.rs being unable to create new posts. I know this works, so I'll use it for now.
            // @TODO
            api.post('/posts/', {
                user: getLoggedInUser(vm.$store).pk,
                content: [],
                comments: [],

            }).then((response) => {
                this.thisUserPosts.push(response.data.pk);
                window.localStorage.setItem("inProgressPost", response.data.pk.toString());
                // We're not even going to bother dealing with the response from fetch post.
                // It will always be undefined because this will never be a cache hit - it can't possibly be,
                // seeing as we just right above made this post!
                fetchPostSubscribe(vm.$store, response.data.pk);
                console.log("After request");

            })
            
            // this.postStatus = vm.SAVED;
        }
    }
    saveLayout() {
        setLayout(this.$store, this.layout);
    }

    //manually check if the pertinent parts of a layout are the same

    sameLayout(layout1 : Object[], layout2: Object[]) : boolean {
        var same : boolean = false;
        if (layout1.length === layout2.length) { //auto-fail.
            same = true;
            for (var x = 0; x < layout1.length; x++) {
                if (layout1["h"] !== layout2["h"] ||
                    layout1["i"] !== layout2["i"] ||
                    layout1["w"] !== layout2["w"] ||
                    layout1["x"] !== layout2["x"] ||
                    layout1["y"] !== layout2["y"] ) 
                {
                    same = false;
                }
            }
        }
        return same;
    }
    public removeElement(index: number) {
        removeElement(this.$store, index);
    }
    public maxElementIndex() {
        return getCurrentPost(this.$store)!.elements!.length;
    }
    public undo() {
        undo(this.$store);
    }
    public redo() {
        redo(this.$store);
    }
    public async getUserPosts() {
        const vm: PostCreate = this;
        // @TODO: use store and Post model for this work
        // This is also all reloaded every time somebody reloads the page.. which is really quite no good.
        let nextPage = 1;
        do {
            var response;

            response = await asLoggedIn(api.get(`/posts/?user_edit=${this.getLoggedInUser.pk}&page=${nextPage.toString()}`));

            for (const post of response.data.results) {
                
                if (post.pk !== -1){
                    fetchPostSubscribe(this.$store, post.pk);
                }
                this.thisUserPosts.push(post.pk);
            }
            nextPage++;
        } while (response.data.next !== null);
    }
    created() {
        const inProgressPost: string | null = window.localStorage.getItem("inProgressPost");

        // Get previous posts from the users
        this.getUserPosts();

        // Were we working on something? Begin post with either that post, or
        // the userid of ourselves to start a completely new one.
        if (inProgressPost === null) {
            this.beginPost(
                // ???? how on earth is this type string | undefined
                // It's definitely just a number. Look at user.ts.
                this.getLoggedInUser.pk as number,
                undefined);
        } else {
            this.beginPost(
                this.getLoggedInUser.pk as number, parseInt(inProgressPost as string));
        }
        let store = this.$store;
        let userpk = this.getLoggedInUser.pk as number;
        let vm: PostCreate = this;

        WebSocket.getInstance().addMessageListener((message) => {
            //debugger;
            const val = JSON.parse(message.data);
            console.log("POST CREATE; got message");
            console.log(val);
            let iPP = window.localStorage.getItem("inProgressPost");
            let inProgressPk: number = -1;
            if (iPP) inProgressPk = parseInt(iPP as string);
            console.log(inProgressPk);
            if (val.payload && val.payload.length > 0 && inProgressPk != -1) {
                for(let p of val.payload){
                    let post = Post.pkify(p.Post);
                    if (post.pk === inProgressPk) {
                        console.log("trying to update the post we see here.")
                        console.log(post);
                        //console.log(this.inProgressPost!.toPost());
                        
                        // let changed: boolean = this.inProgressPost === undefined || !this.inProgressPost!.toPost().equals(post);
                        // console.log(changed);
                        //if(changed){
                            if(this.inProgressPost === undefined || !this.sameLayout(post.layout, this.inProgressPost!.layout)){
                                console.log("changing drag + drop");
                                this.changeDragAndDrop++;
                            }
                            else{
                                console.log("not changing drag + drop");
                            }
                    
                        
                            beginPost(store,{userid: userpk, p: post});
                            vm.postStatus = PostStatus.Saved;
                        //}
                    }
                
                }
                
            }
            return undefined;
        });
    }

    mounted() {
        var vm: PostCreate = this;
        this.$on("submitElement", (element: any, index: number) => {
            this.changeDragAndDrop++;
            // @changed this equality to an === from == ... so if somethign breaks
            // that could be why
            if (index === getCurrentPost(vm.$store)!.elements.length) {
                addElement(vm.$store, element);
            } else {
                editElement(vm.$store, {element, index});
            }
            vm.$router.push({name: "create"});
        });

        this.$on("submitTagChanges", this.saveTagChanges)
    }

};
//# sourceURL=PostCreate.vue
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
    height: 70px;
    background-color: lighten(
        rgba($title-tag-card-background, 0.9),
        15%
    ) !important;
    border-top: 1px solid darken($title-tag-card-background, 10%);
}
</style>
