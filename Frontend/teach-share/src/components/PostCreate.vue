
<template>
<div>


    <div :style="getBodyStyle()">
        <b-container>

            <b-col sm="12" offset-lg="2" lg="8">    
            <b-col cols="8">
            <b-row id="button-bar">

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
                    <router-link :to="{name: 'edit-video', query: {index: this.maxElementIndex()}}">
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
            </b-row>
            </b-col>
            </b-col>
        
        </b-container>
        <b-row>
            <!-- TODO: make this more centered -->
            <b-col offset="2" cols="7">
                <b-container>
                    <b-form-group>
                        <b-card id="title-tag-card">
                            <b-row>
                                <b-col cols="2">
                                    <label for="titleTextbox"><h4><strong>Title: </strong></h4></label>
                                </b-col>

                                <b-col cols="10">
                                    <input class="form-control" @input="titleChanged" type="text" v-model="title"
                                        placeholder="Title required" id="titleTextbox">
                                </b-col>
                            </b-row>
                            <b-row>
                                <b-col cols="2" >
                                    <label for="tagTextbox"><h4><strong>Tags: </strong></h4></label>
                                </b-col>
                                <b-col cols="8">
                                    <input class="form-control" v-model="inProgressTag" v-on:keyup="createTag"
                                        placeholder="add a topic tag" id="tagTextbox">
                                </b-col>
                                <b-col cols="2">
                                    <b-button @click="createTagBtn" id="create-tag-button" variant="primary">
                                        <span>
                                            <font-awesome-icon icon="plus"></font-awesome-icon>
                                        </span>
                                    </b-button>
                                </b-col>
                                <hr>
                                <span :key="index" v-for="(tag,index) in tags">
                                    <span @click="removeTag(index)" class="tag-entry badge badge-dark">{{tag}} <span aria-hidden="true">&times;</span>
                                    </span>
                                </span>
                            </b-row>
                        </b-card>
                    </b-form-group>
                </b-container>
            </b-col>
        </b-row>
        <div :key="index" v-for="(element,index) in storeElements">
            <!-- TODO: the post element background was some other color at some point and it got lost, need to put it back -->
            <div class="post-element-container">
                <b-card class="post-element">
                    <post-element :element="element" :index="index"></post-element>
                </b-card>
                <div class="justify-content-start">
                    <div>
                        <b-button variant="dark" id="up-button" style="z-index: 2;" @click="moveElementUp(index)"><img width=20 height=20 src="/static/caret-square-up.png"></b-button>
                        <b-button variant="dark" id="down-button" style="z-index: 2;" @click="moveElementDown(index)"><img width=20 height=20 src="/static/caret-square-down.png"></b-button>
                        <b-button variant="danger" id="garbage-button" @click="removeElement(index)"><img height=20 src="/static/trash-icon.png"></b-button>
                        <b-button variant="primary" id="edit-button" @click="editElement(index)"><img height=20 src="/static/edit-icon.png"></b-button>
                    </div>
                </div>
            </div>
            <br>
        </div>
    </div>
    <br><br><br> <!-- this is so problems don't occur with bottom of page button presses -->

    <b-navbar fixed="bottom" class="bottom-navbar ">
        <div id="bottomNavTitle" class="title" v-if="title != ''">{{title}}</div>
        <div class="title title-placeholder" v-else></div>
    </b-navbar>


    <b-navbar fixed="bottom">
        <!-- TODO: make the buttons align right like they did previously. -->
        <b-navbar-nav class="ml-auto">
        
            <b-button type="button" variant="outline-danger" class="undo-button" @click="undo">
                <font-awesome-icon icon="undo" fixed-width></font-awesome-icon> undo 
            </b-button>
            
            <b-button type="button" variant="outline-success" class="redo-button" @click="redo">
                <font-awesome-icon icon="redo" fixed-width></font-awesome-icon> redo 
            </b-button>
            
            <b-button type="button" variant="primary" class="submit-button" v-on:click="submitPost">
                <font-awesome-icon icon="check" fixed-width></font-awesome-icon> Publish post
            </b-button>
            
        </b-navbar-nav>
        

    </b-navbar>


<div :style="getEditorStyle()">

      <router-view/>

</div>

</div>
</template>


<script>
import Vue from "vue";
import { mapState } from "vuex";
import forEach from "lodash/forEach";
import PostElement from "./PostElement";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";

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

export default {
    name: "post-create",
    components: { PostElement, FontAwesomeIcon },
    data: function() {
        return {
            title: "",
            editedElement: {},
            editedElementIndex: -1,
            inProgressTag: "",
            tags: []
        };
    },
    computed: {
        storeElements() {
            return this.$store.state.create.postElements;
        },
        nextStateId() {
            return this.$store.state.create.nextStateId;
        }
    },

    methods: {
        getEditorStyle() {
            this.$log(this.$route.name !== "create");
            if (this.$route.name !== "create") {
                return editorVisible;
            } else {
                return editorHidden;
            }
        },
        getBodyStyle() {
            if (this.$route.name !== "create") {
                return bodyHidden;
            } else {
                return bodyVisible;
            }
        },
        nop: function() {},
        removeTag: function(index) {
            this.tags.splice(index, 1);
        },
        createTag: function(e) {
            if (e.keyCode === 13 && this.inProgressTag !== "") {
                this.createTagBtn();
            }
        },
        titleChanged: function(e) {
            console.log(this.title);
            this.$store.dispatch("setTitle", this.title);
        },
        createTagBtn: function() {
            this.tags.push(this.inProgressTag);
            this.inProgressTag = "";
        },
        getUser: function() {
            // this.$store.dispatch("fetchUser", 1);
        },
        submitPost: function(event) {
            console.log(this.$store.state.create.postElements);
            var obj = {
                user: 1,
                title: this.title,
                content: this.$store.state.create.postElements,
                likes: 0,
                comments: [],
                tags: this.tags,
                attachments: []
            };
            console.log(obj);
            var vm = this;

            // Generate current post before posting..
            //
            var currentPost = this.$store.getters.getCurrentPost;
            currentPost.content = this.$store.state.create.postElements;
            currentPost.tags = this.$store.getters.getTags;
            currentPost.title = this.$store.getters.getTitle;
            console.log(currentPost.title);
            currentPost.user = this.$store.getters.getCurrentUser.profile.pk;
            currentPost.draft = false;

            // dispatch createPost method in the store. This will send a
            // post request to the backend server.
            this.$store.dispatch("createPost", currentPost).then(function(ret) {
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
        },
        editElement: function(index) {
            var type = this.$store.state.create.postElements[index].type;
            var routeName = "edit-";
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
            this.$router.push({ name: routeName, query: { index: index } });
        },

        moveElementUp: function(index) {
            if (index != 0) {
                this.$store.dispatch("swapElements", [index, index - 1]);
                //dispatch only allows one argument so we'll pass them as an array
            }
        },
        moveElementDown: function(index) {
            if (index != this.$store.state.create.postElements.length - 1) {
                this.$store.dispatch("swapElements", [index, index + 1]);
                //dispatch only allows one argument so we'll pass them as an array
            }
        },
        removeElement: function(index) {
            this.$store.dispatch("removeElement", index);
        },
        maxElementIndex() {
            return this.$store.state.create.postElements.length;
        },
        undo() {
            this.$store.dispatch("undo");
        },
        redo() {
            this.$store.dispatch("redo");
        }
    }
};
</script>


<style lang="scss" scoped>
$background-color: #e5ffee;
$title-tag-card-background: darken(#bececa, 5%);
$dark-green: #3b896a;
$card-shadow: 4px 8px 8px -1px rgba(0, 0, 0, 0.4);
$card-color: #96e6b3;

.post-element-container {
    padding-top: 30px;
    padding-right: 20px;
    padding-left: 20px;
    padding-bottom: 10px;
    border-radius: 5px;
    box-shadow: $card-shadow;
    background-color: $card-color;
}

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
    min-width: 580px;
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
