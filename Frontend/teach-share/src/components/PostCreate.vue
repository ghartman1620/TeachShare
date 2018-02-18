
<template>

<body>

<div >
<div id="buttonbar">
<!-- Text button -->

<router-link :to="{ name: 'edit-text', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="text-button"></button>
</router-link>
<router-link :to="{name: 'edit-video', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="video-button"></button>
</router-link>
<router-link :to="{name: 'edit-audio', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="audio-button"></button>
</router-link>
<router-link :to="{name: 'edit-image', query: {index: this.maxComponentIndex()}}">
  <button type="button" class="btn btn-default btn-circle btn-xl" id="image-button"></button>
</router-link>
  <button type="button" class="btn btn-default btn-circle btn-xl" id="file-button"><i class="glyphicons glyphicons-folder-open"></i></button>
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
    <router-link :to="{ name: 'edit-text', query: {index: index}}"><button><font face="courier">E</font></button></router-link>

  </div>
  <div class="post-component card" v-else-if="component.type === 'image'">
    <p>An image component!</p>  
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
  <div class="post-component card" v-else-if="component.type === 'video'">
    <p>A video component!</p>  
  </div>
  <div class="post-component card" v-else>
    <p>A file component!</p>  `
  </div>
  </div>
  <div class="col 11">
    <div id="arrange-btn-group" class="btn-group-vertical">
      <button @click="removeComponent(index)"><font face="courier">x</font></button>
    
    </div>
  </div>
  
  </div>
</div>
<button v-on:click="submitPost">Publish</button>
</div>
<router-view/>
<button @click="undo">undo </button>

<button @click="redo">redo </button>

</body>


</template>


<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import ViewText from './ViewText';
import AudioComponent from './audio/AudioComponent'

export default {

  name: 'post-create',
  data: function() {
    return {
      title: '',
      editedComponent: {},
      editedComponentIndex: -1,
      inProgressTag: '',
      tags: [],
    }
  },
  computed:{
    storeComponents() {
      return this.$store.state.create.postComponents;
    },
    nextStateId() {
      return this.$store.state.create.nextStateId;  
    },

  },

  methods: {
    nop: function(){},
    removeTag: function(index) {
      console.log('remove tag' + index);
      this.tags.splice(index, 1);
    },
    createTag: function(e) {
      if (e.keyCode === 13 && this.inProgressTag !== '') {
        console.log('enter pressed');
        this.tags.push(this.inProgressTag);
        this.inProgressTag = '';
      }
    },
    getUser: function(){
      this.$store.dispatch('fetchUser', 1)
    },
    submitPost: function(event){
      console.log(this.$store.state.create.postComponents);
      var obj = {
        user : 1, 
        title : this.title, 
        content : this.$store.state.create.postComponents,
        likes : 0,
        comments : [],
        tags: this.tags,
        attachments : [],
      }
      console.log(obj)
      this.$store.dispatch('createPost', obj)
    },

    createTextComponent: function(event){
      this.editedComponent = {
        'type': 'text',
        'contents' : '<p></p>',
      }
      this.editedComponentIndex = this.$store.state.create.postComponents.length;
      
      this.$store.dispatch('changeEditedComponent', 'edit-text');
      console.log('create text component');
      
    },
    createImageComponent: function(event){
      this.$store.dispatch('changeEditedComponent', 'edit-image');
      console.log('create image component');
    },
    createAudioComponent: function(event){

      console.log('hi world');
      
    },
    createVideoComponent: function(event){

      console.log('hi world');
      
    },
    createFileComponent: function(event){

      console.log('hi world');
      
    },
    moveComponentUp: function(index){
      console.log('moveComponentUp:'  + index);
      if(index != 0){
        this.$store.dispatch('swapComponents', [index,index-1]);   
        //dispatch only allows one argument so we'll pass them as an array        
      }
    },
    moveComponentDown: function(index){
      if(index != this.$store.state.create.postComponents.length-1){
        this.$store.dispatch('swapComponents', [index,index+1]);   
        //dispatch only allows one argument so we'll pass them as an array        
      }
    },
    removeComponent: function(index){
      this.$store.dispatch('removeComponent', index);
    },
    maxComponentIndex() {
      return this.$store.state.create.postComponents.length;
    },
    undo() {
      this.$store.dispatch('undo');
    },
    redo() {
      this.$store.dispatch('redo');
    }
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
