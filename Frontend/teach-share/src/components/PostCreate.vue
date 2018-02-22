


<template>

<body>

<div>
<!--div-- id="buttonbar">

<router-link :to="{ name: 'edit-text', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="text-button"></button>
</router-link>
<router-link :to="{name: 'edit-video', query: {index: this.maxComponentIndex(), videotype: 'embed'}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="video-button"></button>
</router-link>
<router-link :to="{name: 'edit-audio', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="audio-button"></button>
</router-link>
<router-link :to="{name: 'edit-image', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="image-button"></button>
</router-link>
  <button type="button" class="btn btn-default btn-circle btn-xl" id="file-button"><i class="glyphicons glyphicons-folder-open"></i></button>
</div-->

    <div class="col-8 offset-2 card card-outline-danger container icon-card-container">
      <div class="mx-auto card-deck">

        <!--router-link :to="{ name: 'edit-text', query: {index: this.maxComponentIndex()}}">
            </router-link>

        <!--/section-->
        <h2></h2>

        <div class="mx-auto round-button" id="text-icon">
          <router-link :to="{ name: 'edit-text', query: {index: this.maxComponentIndex()}}">
            <img src="/static/text-button.png"
                 onmouseover="this.src='/static/text-button-hover.png'"
                 onmouseout="this.src='/static/text-button.png'">
          </router-link>
        </div>
        <h2></h2>

        <div class="mx-auto round-button" id="video-icon">
          <router-link :to="{name: 'edit-video', query: {index: this.maxComponentIndex(), videotype: 'embed'}}">
            <img src="/static/video-button.png"
                 onmouseover="this.src='/static/video-button-hover.png'"
                 onmouseout="this.src='/static/video-button.png'">

          </router-link>
        </div>
        <h2></h2>

        <div class="mx-auto round-button" id="audio-icon">
          <router-link :to="{name: 'edit-audio', query: {index: this.maxComponentIndex()}}">
            <img src="/static/audio-button.png"
                 onmouseover="this.src='/static/audio-button-hover.png'"
                 onmouseout="this.src='/static/audio-button.png'">
          </router-link>
        </div>
        <h2></h2>

        <div class="mx-auto round-button" id="image-icon">
          <router-link :to="{name: 'edit-image', query: {index: this.maxComponentIndex()}}">
            <img src="/static/image-button.png" >
          </router-link>
        </div>

        <div class="mx-auto round-button" id="file-icon">
          <a href="">
            <img src="/static/file-button.png"
                 onmouseover="this.src='/static/file-button-hover.png'"
                 onmouseout="this.src='/static/file-button.png'">
          </a>
        </div>




        <!--section class="icon card mb-5 icon" id="video-button">
          <h2></h2>
          <router-link :to="{name: 'edit-video', query: {index: this.maxComponentIndex(), videotype: 'embed'}}">

        <img class="card-img" src="/static/video-button.png" alt="video-icon">
        </router-link>


        </section>


        <section class="icon card mb-5 icon" id="audio-button">
          <h2></h2>
          <router-link :to="{name: 'edit-audio', query: {index: this.maxComponentIndex()}}">

          <img class="card-img" src="/static/audio-button.png" alt="audio-icon">
          </router-link>


        </section>

        <section class="icon card mb-5 icon" id="image-button">
          <h2></h2>
          <router-link :to="{name: 'edit-image', query: {index: this.maxComponentIndex()}}">

          <img class="card-img" src="/static/image-button.png" alt="img-icon">
          </router-link>
        </section>

        <section class="icon card mb-5 icon" id="file-button">
          <h2></h2>

          <img class="card-img" src="/static/file-button.png" alt="file-icon">


        </section-->

      </div>


    <!--/div-->


  <div class="title-tags-container col-7 col-sm-10 col-xs-12 container">
<input class="postheader form-control" type="text" v-model.lazy="title" placeholder="Title required"></input><br>
<div class="mx-auto tag-card col-7 card">
<div v-for="(tag,index) in tags"> {{tag}} <button type="button" class="btn btn-sm btn-light" @click="removeTag(index)">{{"X"}}</button></div>
<form v-on:submit.prevent="nop">
<input class="postheader form-control" v-model="inProgressTag" v-on:keyup="createTag" placeholder="add a topic tag"></input>
</form>





</div>
</div>

<div class="col- container" v-for="(component,index) in storeComponents">
  <div class="card-row row">
  <div class="col-1">
    <div id="arrange-btn-group" class="btn-group-vertical">
      <button @click="moveComponentUp(index)" class="up-down-button"><font face="courier">^</font></button>
      <button @click="moveComponentDown(index)" class="up-down-button"><font face="courier">v</font></button>
    </div>
  </div>
  <div class="col-10 container">
  <div class="post-component container col-8" v-if="component.type === 'text'">
    <view-text :component="component"></view-text>
    <router-link :to="{ name: 'edit-text', query: {index: index}}"><button><font face="courier">E</font></button></router-link>

  </div>
  <div class="post-component card" v-else-if="component.type === 'image_file'">
    <image-component :title="component.title" :body="component.description" :images="component.content"/>
  </div>
  <div class="post-component card" v-else-if="component.type === 'audio'">
    <audio-component :id="component.content[0].id"
    :title="component.content[0].title"
    :body="component.content[0].description"
    :controls="true" :source="component.content[0].url"
    :filetype="component.content[0].filetype"
    autoplay="false"/>
    <router-link :to="{ name: 'edit-audio', query: {index: index}}"><button><font face="courier">E</font></button></router-link>

  </div>

  <div class="post-component card" v-else-if="component.type === 'video_link' || component.type === 'video_file'">
      <div v-if="component.type === 'video_link'">
          <video-component
            name="vid-comp1"
            :id="component.content.id"
            :height="component.content.height"
            :width="component.content.width"
            :title="component.content.title"
            :source="component.content.url"
            controls="true"
            autoplay="false"
            isEmbed=true>
          <div slot="description">{{component.content.description}}</div>
          </video-component>
        </div>
        <div v-else>
          <video-component
            name="vid-comp2"
            :id="component.content.id"
            :height="component.content.height"
            :width="component.content.width"
            :title="component.content.title"
            :source="component.content.url"
            controls="true"
            autoplay="false"
            isFile=true>
          <div slot="description">{{component.content.description}}</div>
          </video-component>
       </div>
  </div>
  <div class="post-component card" v-else-if="component.type === 'file'">
    <p>A file component!</p>  `
  </div>
  <div v-else>
    Something bad!
    {{component}}
  </div>
  </div>
  <div class="col 11">
    <div id="arrange-btn-group" class="btn-group-vertical">
      <button @click="removeComponent(index)"><font face="courier">x</font></button>

    </div>
  </div>

  </div>


</div>
</div>

<router-view/>


</div>

<nav class="navbar fixed-bottom navbar-light navbar-left bg-transparent">
  <div class="title-display" v-if="title.type === string">{{title}}</div>
  <v-else > </v-else>
</nav>


<nav class="navbar fixed-bottom justify-content-end bg-transparent">

  <button type="button" class="undo-button align-right btn btn-sm btn-outline-dark btn-primary-spacing" @click="undo">undo </button>
  <button type="button" class="redo-button align-right btn btn-sm btn-outline-dark btn-primary-spacing" @click="redo">redo </button>
  <button type="button" class="submit-button btn btn-light btn-outline-info" v-on:click="submitPost">Publish post</button>


</nav>

</body>




</template>


<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import ViewText from './ViewText';
import AudioComponent from './audio/AudioComponent'
import ImageComponent from './image/ImageComponent'
import VideoComponent from "./video/VideoComponent";

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
};

export default {
  name: "post-create",
  components: { ViewText, AudioComponent, ImageComponent, VideoComponent },
  data: function() {
    return {
      title: "",
      editedComponent: {},
      editedComponentIndex: -1,
      inProgressTag: "",
      tags: []
    };
  },
  computed: {
    storeComponents() {
      return this.$store.state.create.postComponents;
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
      console.log(this.$store.state.create.postComponents);
      var obj = {
        user: 1,
        title: this.title,
        content: this.$store.state.create.postComponents,
        likes: 0,
        comments: [],
        tags: this.tags,
        attachments: []
      };
      console.log(obj);
      this.$store.dispatch("createPost", obj);
    },
    editComponent: function(index) {
      this.$store.dispatch(
        "setEditedComponent",
        this.$store.state.create.postComponents[index]
      );
    },

    moveComponentUp: function(index) {
      console.log("moveComponentUp:" + index);
      if (index != 0) {
        this.$store.dispatch("swapComponents", [index, index - 1]);
        //dispatch only allows one argument so we'll pass them as an array
      }
    },
    moveComponentDown: function(index) {
      if (index != this.$store.state.create.postComponents.length - 1) {
        this.$store.dispatch("swapComponents", [index, index + 1]);
        //dispatch only allows one argument so we'll pass them as an array
      }
    },
    removeComponent: function(index) {
      this.$store.dispatch("removeComponent", index);
    },
    maxComponentIndex() {
      return this.$store.state.create.postComponents.length;
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
      background: #e5ffee;
      box-shadow: 0 0 0px gray;
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

/* Submitted components now being viewed */
.container-component {
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

.title-display {
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

.post-component, card-row {
  background-color: #FFFFFF;
}

.title-tags-container {
  padding-top: 1rem;
}

</style>
