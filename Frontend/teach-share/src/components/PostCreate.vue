


<template>
<div>
<div :style="getBodyStyle()">
    <div class="col-8 offset-2 card card-outline-danger container icon-card-container">
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
            <form>
                <div class="form-group">
                    <div id="title-tag-card" class="card mx-auto">
                        <br>
                        <div class="title-container container">
                            <br>
                            <label for="titleTextbox"><h4><strong>Title: </strong></h4></label>
                            <input class="form-control" type="text" v-model.lazy="title"
                                placeholder="Title required" id="titleTextbox">
                            <br>
                        </div>

                        <div class="tag-card card">
                            <label for="tagTextbox">Tags: </label>
                            <div class="row">
                                <div class="col-8">
                                    <input class="form-control" v-model="inProgressTag" v-on:keyup="createTag"
                                        placeholder="add a topic tag" id="tagTextbox">
                                </div>
                                <div class="col-4">
                                    <button @click="createTagBtn" class="btn btn-block btn-primary"><strong>Create Tag</strong></button>
                                </div>
                            </div>
                            <hr>
                            <span id="tag-container" :key="index" v-for="(tag,index) in tags">
                                <span @click="removeTag(index)" class="tag-entry badge badge-dark">{{tag}} <span aria-hidden="true">&times;</span>
                                    <!-- <button id="tag-delete-button" type="button" class="btn btn-sm btn-dark" >{{"x"}}</button> -->
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
        <div class=" col-12 container" :key="index" v-for="(element,index) in storeElements">
            <div class="post-element-container">
                <div class="card-column column">
                  <div class="col-12 container">
                    <div class="post-element card">
                      <post-element :element="element" :index="index"></post-element>
                    </div>
                  </div>

                  <div class="justify-content-start">
                        <div id="mx-auto col-9 arrange-btn-group" class="btn-group-horizontal">

                            <button class="btn btn-dark" id="up-button" style="z-index: 2;" @click="moveElementUp(index)"><img width=20 height=20 src="/static/caret-square-up.png"></button>
                            <button class="btn btn-dark" id="down-button" style="z-index: 2;" @click="moveElementDown(index)"><img width=20 height=20 src="/static/caret-square-down.png"></button>
                            <!-- <input type="image" id="down-button" width=30 height=30 style="z-index: 2" @click="moveElementDown(index)" src="/static/caret-square-down.png"/> -->
                            <button class="btn btn-danger" id="garbage-button" @click="removeElement(index)"><img width=20 height=20 src="/static/trash-icon.png"></button>
                            <!-- <input type="image" id="garbage-button" width=30 height=30 @click="removeElement(index)" src="/static/trash-icon.png"> -->
                            <button class="btn btn-primary" id="edit-button" @click="editElement(index)"><img width=20 height=20 src="/static/edit-icon.png"></button>
                            <!-- <input type="image" id="edit-button" width=30 height=30 @click="editElement(index)" src="/static/edit-icon.png"> -->

                        </div>
                    </div>
                </div>
            </div>
            <br>
        </div>
    </div>
    <br><br><br> <!-- this is so problems don't occur with bottom of page button presses -->
    <nav class="navbar fixed-bottom navbar-light navbar-left bottom-navbar bg-light">
        <div id="bottomNavTitle" class="title" v-if="title != ''">{{title}}</div>
        <div class="title title-placeholder" v-else></div>
    </nav>


    <nav class="navbar fixed-bottom justify-content-end bg-transparent">
        <button type="button" class="undo-button align-right btn btn-sm btn-outline-danger btn-primary-spacing" @click="undo">undo </button>
        <button type="button" class="redo-button align-right btn btn-sm btn-outline-success btn-primary-spacing" @click="redo">redo </button>
        <button type="button" class="submit-button btn btn-primary" v-on:click="submitPost">Publish post</button>
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


<script>
import Vue from "vue";
import { mapState } from "vuex";

import PostElement from "./PostElement";

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
};

const editorHidden = {
    "z-index" : "-1",
}
const editorVisible = {
    position: "fixed",
    width: "80%",
    left: "10%",
    "max-height": "75%",
    top: "20%",
    "z-index" : "1",
    "overflow-y" : "scroll",
    "overflow-x" : "hidden",
}

const bodyHidden = {
    opacity: ".3",
    "pointer-events" : "none",
    overflow: "hidden",
};
const bodyVisible = {
    opacity: "1",
}


export default {
    name: "post-create",
    components: { PostElement },
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
            if(this.$store.state.create.editorOpen){

                return editorVisible;
            }
            else{
                return editorHidden;
            }
        },
        getBodyStyle() {
            if(this.$store.state.create.editorOpen){
                return bodyHidden;
            }
            else{
                return bodyVisible;
            }
        },
        nop: function() {},
        removeTag: function(index) {
            console.log("remove tag" + index);
            this.tags.splice(index, 1);
        },
        createTag: function(e) {
            if (e.keyCode === 13 && this.inProgressTag !== "") {
                this.createTagBtn();
            }
        },
        createTagBtn: function() {
            this.tags.push(this.inProgressTag);
            this.inProgressTag = "";
        },
        getUser: function() {
            this.$store.dispatch("fetchUser", 1);
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
            this.$store.dispatch("createPost", obj);
        },
        editElement: function(index) {
            var type = this.$store.state.create.postElements[index].type;
            var routeName = "edit-";
            if(type === "text"){
                routeName += "text";
            } else if(type === "audio"){
                routeName += "audio";
            } else if(type === "video_file" || type === "video_link"){
                routeName += "video";
            } else if(type === "image_file"){
                routeName += "image";
            } else{
                routeName += "file";
            }
            console.log(routeName);
            this.$router.push({name: routeName, query: {index: index}});
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

$background-color: #E5FFEE;
$title-tag-card-background: #bececa;

// @import "../../node_modules/bootstrap/scss/_variables.scss";
@import "../../node_modules/bootstrap/scss/_functions.scss";
@import "../../node_modules/bootstrap/scss/_variables.scss";
@import "../../node_modules/bootstrap/scss/_mixins.scss";

$theme-colors: (
    "primary": red
);

.post-element-container {
    padding-top: 30px;
    padding-right: 20px;
    padding-left: 20px;
    padding-bottom: 10px;
    // box-shadow: 5px 8px #bdbdbd;
    background-color: transparent;
}

.tag-entry {
    font-size: 12pt;
    margin: 8px;
    // padding-left: 20px;
    // padding-right: 20px;
}

.tag-entry:hover {
    background-color: darken(gray, 10%);
    cursor: pointer;
}

.round-button {
    max-width: 100px;
    max-height: 100px;
    /* padding-bottom: 11%; */
    // border-radius: 50%;
    // border: 0 solid #f5f5f5;
    // overflow: hidden;
    // background:  $title-tag-card-background;
    /* box-shadow: 1 1 4px gray; */
}

#button-bar {
    min-width: 600px;
    /* max-height: 240px; */
    /* padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 1px;
    padding-right: 1px; */
    background: $background-color;
    justify-content: center;
    /* box-shadow: 0px 8px #bdbdbd; */
}

#text-icon {
    margin-right: .2rem;
}

#audio-icon {
    margin-left: .2rem;
    margin-right: .2rem;

}
#video-icon {
    margin-left: .2rem;
    margin-right: .2rem;

}
#image-icon {
    margin-left: .2rem;
    margin-right: .2rem;

}
#file-icon {
    margin-left: .2rem;

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
    background: #13213F;
}
#file-icon:hover {
    background: #1a3c68;
}

#title-tag-card {
    background-color: $title-tag-card-background;
    margin-top: 2rem;
    // margin-bottom: 2rem;
    // width: 100%;
    // max-width: 100%;
    /* padding: 1rem; */
    /* box-shadow: 5px 5px #bdbdbd; */
    // border: 0;
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
}

#down-button {
    margin-top: 10px;
    margin-left: 6px;
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
    width: 90px;
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
    background-color: white;
    border: 0;
}

.card {
    background-color:$background-color;
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
    // width: 100%;
    display:inline;
    padding: 10px;
}


.post-element, card-row {
    background-color:  $title-tag-card-background;
}

.title-container {
    width: 100%;
}

.bottom-navbar {
    height: 50px;
    background-color: lighten($title-tag-card-background, 15%) !important;
}
</style>
