
<template>

<body>
<router-view/>

<component class="card container foreground" v-bind:component="editedComponent" :index="editedComponentIndex"v-bind:is="editedComponentType"></component>
<div :style=opacity>
<div id="buttonbar">
<!-- Text button -->

<button type="button" v-on:click="createTextComponent"  class="btn btn-default btn-circle btn-xl" id="text-button"><span class="glyphicon glyphicon-asterisk"></span></button>
<button type="button" v-on:click="createImageComponent" class="btn btn-default btn-circle btn-xl" id="image-button"><i class="glyphicon glyphicon-picture"></i></button>
<button type="button" v-on:click="createAudioComponent" class="btn btn-default btn-circle btn-xl" id="audio-button"><i class="glyphicon glyphicons-music"></i></button>
<button type="button" v-on:click="createVideoComponent" class="btn btn-default btn-circle btn-xl" id="video-button"><i class="glyphicons glyphicons-film"></i></button>
<button type="button" v-on:click="createFileComponent" class="btn btn-default btn-circle btn-xl" id="file-button"><i class="glyphicons glyphicons-folder-open"></i></button>
</div>
<div class="container">
<input class="postheader" type="text" v-model="title" placeholder="title"></input><br>
<div class="card">
<div v-for="(tag,index) in tags"> <button @click="removeTag(index)">{{tag}}</button></div>
<form v-on:submit.prevent="nop">
<input class="postheader" v-model="inProgressTag" v-on:keyup="createTag" placeholder="tags"></input>
</form>

</div>
</div>

<div class="container" v-for="(component,index) in storeComponents">
  <div class="row">
  <div class="col-1"><!-- col-xs-auto -->
    <div id="arrange-btn-group" class="btn-group-vertical">
      <button @click="moveComponentUp(index)" class="up-down-button"><font face="courier">^</font></button>
      <button @click="moveComponentDown(index)" class="up-down-button"><font face="courier">v</font></button>
    </div>
  </div>
  <div class="col-10"> <!-- col-11 -->
  <div class="post-component card" v-if="component.type === 'text'">
    <view-text :component="component"></view-text>
  </div>
  <div class="post-component card" v-else-if="component.type === 'image'">
    <p>An image component!</p>
  </div>
  <div class="post-component card" v-else-if="component.type === 'audio'">
    <p>An audio component!</p>
  </div>
  <div class="post-component card" v-else-if="component.type === 'video'">
    <p>A video component!</p>
  </div>
  <div class="post-component card" v-else>
    <p>A file component!</p>
  </div>
  </div>
  <div class="col 11">
    <div id="arrange-btn-group" class="btn-group-vertical">
      <button @click="removeComponent(index)"><font face="courier">x</font></button>
      <button @click="editComponent(index)"><font face="courier">E</font></button>

    </div>
  </div>

  </div>
</div>
<button v-on:click="submitPost">Publish</button>
</div>

</body>

</template>


<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import EditText from './EditText';
import EditImage from './images/EditImage';
import ViewText from './ViewText';

export default {

  name: 'PostCreate',
  data: function() {
    return {
      title: "",
      editedComponent: {},
      editedComponentIndex: -1,
      inProgressTag: "",
      tags: [],
    }
  },
  computed: mapState({
    editedComponentType: state => state.inProgressPostEditedComponentType,
    storeComponents: state => state.inProgressPostComponents,
    opacity: state => state.postOpacity
  }),
  methods: {
    nop: function(){},
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
    getUser: function(){
      this.$store.dispatch('fetchUser', 1)
    },
    submitPost: function(event){
      console.log(this.$store.state.inProgressPostComponents);
      var obj = {
        "user" : 1,
        "title" : this.title,
        "content" : JSON.stringify(this.$store.state.inProgressPostComponents),
        "likes" : 0,
        "comments" : [],
        "tags": JSON.stringify(this.tags),
        "attachments" : [],
      }
      console.log(obj)
      this.$store.dispatch('createPost', obj)
    },
    editComponent: function(index) {
      this.editedComponent = this.$store.state.inProgressPostComponents[index];
      this.editedComponentIndex = index;
      this.$store.dispatch("changeEditedComponent", "edit-" + this.editedComponent.type);
    },
    createTextComponent: function(event){
      this.editedComponent = {
        "type": "text",
        "contents" : "<p></p>",
      }
      this.editedComponentIndex = this.$store.state.inProgressPostComponents.length;

      this.$store.dispatch("changeEditedComponent", "edit-text");
      console.log("create text component");
      this.opacity.opacity = .3;

    },
    createImageComponent: function(event){
      this.$store.dispatch("changeEditedComponent", "edit-image");
      console.log("create image component");
    },
    createAudioComponent: function(event){

      console.log("hi world");
      this.opacity.opacity = .3;

    },
    createVideoComponent: function(event){

      console.log("hi world");
      this.opacity.opacity = .3;

    },
    createFileComponent: function(event){

      console.log("hi world");
      this.opacity.opacity = .3;

    },
    moveComponentUp: function(index){
      console.log("moveComponentUp:"  + index);
      if(index != 0){
        this.$store.dispatch("swapComponents", [index,index-1]);
        //dispatch only allows one argument so we'll pass them as an array
      }
    },
    moveComponentDown: function(index){
      if(index != this.$store.state.inProgressPostComponents.length-1){
        this.$store.dispatch("swapComponents", [index,index+1]);
        //dispatch only allows one argument so we'll pass them as an array
      }
    },
    removeComponent: function(index){
      this.$store.dispatch("removeComponent", index);
    }
  },
  beforeMount(){
    this.getUser()
  },
}

</script>


<style scoped>


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
  width:100%;
}


/* Submitted components now being viewed */
.container-component {
  width:60%;
  height: 300px;
}
#arrange-btn-group {
  /*position: absolute;
  left: 23%;
  width: 2%; */
}
.up-down-button {

}
.post-component {
  /*position: absolute;
  left: 25%;
  width: 50%;*/
}



/* The five buttons on the button bar */
#text-button { background: #FFAE03; }
#image-button { background: #1D3461; }
#audio-button { background: #42AA8B; }
#video-button { background: #E07700; }
#file-button { background: #23528E; }
#buttonbar {
  margin: auto;
  width:368px;
  height: 70px;
  background-color: #99B5AA;
  border-radius: 15px;
}
.btn-circle {
  width: 30px;
  height: 30px;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.428571429;
  border-radius: 15px;
}
.btn-circle.btn-xl {
  width: 70px;
  height: 70px;
  margin: 0px;
  font-size: 24px;
  line-height: 1.33;
  border-radius: 35px;
}
.btn-ciricle.btn-xl:hover {
  box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}



</style>
