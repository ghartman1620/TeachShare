


<template>

<body>

<div>
    <div class="col-8 offset-2 card card-outline-danger container icon-card-container">
        <div class="col-8 mx-auto card-deck" id="button-bar">

            <h2></h2>
            <div class="col-0 round-button" id="text-icon">
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

        <div class="title-tags-container col-7 container">
            <input class="postheader form-control" type="text" v-model.lazy="title"
                placeholder="Title required"></input>
            <br>
        </div>

      <div class="mx-auto tag-card col-6 card">
        <div :key="index" v-for="(tag,index) in tags">
          {{tag}}
          <button type="button" class="btn btn-sm btn-light" @click="removeTag(index)">{{"X"}}</button>
        </div>

        <form v-on:submit.prevent="nop">
            <input class="postheader form-control" v-model="inProgressTag" v-on:keyup="createTag"
                placeholder="add a topic tag"></input>
        </form>
    </div>


        <div class="col-12 container" :key="index" v-for="(element,index) in storeElements">
            <div class="card-row row">
                <div class="col-1">
                    <div id="arrange-btn-group" class="btn-group-vertical">
                        <button @click="moveElementUp(index)" class="up-down-button"><font face="courier">^</font></button>
                        <button @click="moveElementDown(index)" class="up-down-button"><font face="courier">v</font></button>
                    </div>
                </div>
                <div class="col-10 container">
                    <div class="post-element card">
                        <post-element :element="element"></post-element>
                    </div>
                </div>
                <div class="col 11">
                    <div id="arrange-btn-group" class="btn-group-vertical">
                        <button @click="removeElement(index)"><font face="courier">x</font></button>

                    </div>
                </div>
            </div>
        </div>
    </div>
    <router-view/>
</div>
<br><br><br> <!-- this is so problems don't occur with bottmo of page button presses -->
<nav class="navbar fixed-bottom navbar-light navbar-left bg-light">
    <div class="title" v-if="title != ''">{{title}}</div>
    <div class="title title-placeholder" v-else> Your post needs a title! </div>
</nav>


<nav class="navbar fixed-bottom justify-content-end bg-transparent">
    <button type="button" class="undo-button align-right btn btn-sm btn-outline-dark btn-primary-spacing" @click="undo">undo </button>
    <button type="button" class="redo-button align-right btn btn-sm btn-outline-dark btn-primary-spacing" @click="redo">redo </button>
    <button type="button" class="submit-button btn btn-light btn-outline-info" v-on:click="submitPost">Publish post</button>
</nav>
</body>
</template>


<script>
import Vue from "vue";
import { mapState } from "vuex";

import TextElement from "./text/TextElement";
import AudioElement from "./audio/AudioElement";
import ImageElement from "./image/ImageElement";
import VideoElement from "./video/VideoElement";
import FileElement from "./file/FileElement";

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
};

export default {
    name: "post-create",
    components: { TextElement, FileElement, AudioElement, ImageElement, VideoElement },
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

        nop: function() {},
        removeTag: function(index) {
            console.log("remove tag" + index);
            this.tags.splice(index, 1);
        },
        createTag: function(e) {
            if (e.keyCode === 13 && this.inProgressTag !== "") {
                console.log("enter pressed");
                this.tags.push(this.inProgressTag);
                this.inProgressTag = "";
            }
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
            this.$store.dispatch(
                "setEditedElement",
                this.$store.state.create.postElements[index]
            );
        },

        moveElementUp: function(index) {
            console.log("moveElementUp:" + index);
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


<style scoped>



    .round-button {
            width: 10%;
            height: 0;
            padding-bottom: 11%;
            border-radius: 50%;
            border: 0 solid #f5f5f5;
            overflow: hidden;
            background: #bececa;
            box-shadow: 0 0 0px gray;
        }

    #button-bar {
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 1px;
        padding-right: 1px;
        background: #bececa;
        border-radius: 35px;
        justify-content: center;
    }
    #text-icon {
        margin-right: 1rem;
    }
    #audio-icon {
      margin-left: 1rem;
      margin-right: 1rem;

    }
    #video-icon {
      margin-left: 1rem;
      margin-right: 1rem;

    }
    #image-icon {
      margin-left: 1rem;
      margin-right: 1rem;

    }
    #file-icon {
      margin-left: 1rem;

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

.title-placeholder {
  opacity: 0.5;
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
    padding-left: 5px;
    padding-right: 5px;
    /*background-color: #99b5aa;*/
    background-color: #e5ffee;
}

.title {
    font-size: 1.5rem;
}

.undo-button {
    margin-right: 1rem;
}

.redo-button {
    margin-right: 1rem;
}

.tag-card {
    background-color: #FFFFFF;
    margin-bottom: 30px;
}

.post-element, card-row {
    background-color: #FFFFFF;
}

.title-tags-container {
    padding-top: 1rem;
}

</style>
