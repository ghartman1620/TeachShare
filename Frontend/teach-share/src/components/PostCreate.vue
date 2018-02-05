<!--
Questions for today:
logging in with vue? - TODO
difference between commit and dispatch
# in url?
-->


<template>

<body>

<nav class="navbar navbar-inverse ">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="/account/dashboard">
        <img src="http://127.0.0.1:8000/static/img/tslogo.png" alt="TSLogo"/>
      </a>
    </div>
  <!-- Search bar -->
    <form class="navbar-form navbar-left nav-searchpad" 
		method="post" id="search" action="<!-- search the dashboard -->">
      <div class="form-group">
		<input type="text" name="search" class="form-control" placeholder="Search">
	 </div>
      <button type="submit" class="btn btn-default">Submit</button>
    </form>
  <!-- Create a Post Button -->
    <ul class="nav navbar-nav nav-navitems">
      <li><a href="/account/create/">
        <p>New Post <span class="glyphicon glyphicon-plus-sign"></span> </p>
        </a>
      </li>
    </ul>
  <!-- Dropdown Account Menu -->
    <ul class="nav navbar-nav navbar-right">
      <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" >
          <img src="http://127.0.0.1:8000/static/img/applelogo.png" alt="TSLogo"/>
        <span class="caret"></span></a>
        <ul class="dropdown-menu">
		  <li><a href="/account/profile/">Profile</a></li>
          <li><a href="/account/favorites">Favorites</a></li>
		  <li><a href="/account/profile/edit/">Settings</a></li>
          <li><a href="/account/logout">Log Out</a></li>
        </ul>
      </li>
    </ul>
  </div>
</nav> <!-- ./End Navbar -->

<input class="postheader" type="text" v-model="title" placeholder="title"></input><br>
<input class="postheader" type="text" placeholder="tags"></input>

<div id="buttonbar">
<!-- Text button -->

<button type="button" v-on:click="createTextComponent"  class="btn btn-default btn-circle btn-xl" id="text-button"><span class="glyphicon glyphicon-asterisk"></span></button>
<button type="button" v-on:click="createImageComponent" class="btn btn-default btn-circle btn-xl" id="image-button"><i class="glyphicon glyphicon-picture"></i></button>
<button type="button" v-on:click="createAudioComponent" class="btn btn-default btn-circle btn-xl" id="audio-button"><i class="glyphicon glyphicons-music"></i></button>
<button type="button" v-on:click="createVideoComponent" class="btn btn-default btn-circle btn-xl" id="video-button"><i class="glyphicons glyphicons-film"></i></button>
<button type="button" v-on:click="createFileComponent" class="btn btn-default btn-circle btn-xl" id="file-button"><i class="glyphicons glyphicons-folder-open"></i></button>
</div>
<component v-bind:is="editedComponent"></component>

<li v-for="component in storeComponents">
  <div v-if="component.type === 'text'">
    <view-text :component="component"></view-text>
  </div>
  <div v-else-if="component.type === 'image'">
    <p>An image component!</p>  
  </div>
  <div v-else-if="component.type === 'audio'">
    <p>An audio component!</p>  
  </div>
  <div v-else-if="component.type === 'video'">
    <p>A video component!</p>  
  </div>
  <div v-else>
    <p>A file component!</p>  
  </div>
</li>
<button v-on:click="submitPost">Submit</button>
</body>
</template>


<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import EditText from './EditText';
import EditImage from './EditImage';
import ViewText from './ViewText';

export default {

  name: 'PostCreate',
  data: function() {
    return {
      title: "",
    }
  },
  computed: mapState({
    editedComponent: state => state.inProgressPostEditedComponentType,
    storeComponents: state => state.inProgressPostComponents,
  }),
  methods: {
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
        "tags": [],
        "attachments" : [],
      }
      console.log(obj)
      this.$store.dispatch('createPost', obj)
    },
    createTextComponent: function(event){
      console.log("begin create text component");
      this.$store.dispatch("changeEditedComponent", "edit-text");
      console.log("create text component");
    },
    createImageComponent: function(event){
      this.$store.dispatch("changeEditedComponent", "edit-image");
      console.log("create image component");
    },
    createAudioComponent: function(event){

      console.log("hi world");
    },
    createVideoComponent: function(event){

      console.log("hi world");
    },
    createFileComponent: function(event){

      console.log("hi world");
    },
    
  },
  beforeMount(){
    this.getUser()
  },
}

</script>


<style>
.postheader {
  width: 40%;
  margin: auto;
  height: 30px;
  
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
  padding: 10px 16px;
  vertical-align: middle;
  font-size: 24px;
  line-height: 1.33;
  border-radius: 35px;
}
.btn-ciricle.btn-xl:hover {
  box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}


#text-button { background: #FFAE03; }
#image-button { background: #1D3461; }
#audio-button { background: #42AA8B; }
#video-button { background: #E07700; }
#file-button { background: #23528E; }

#buttonbar {
  margin: auto;
  width: 380px;
  height: 100px;
  background-color: #99B5AA;
  border-radius: 15px;
}

</style>
