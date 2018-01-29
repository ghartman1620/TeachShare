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


<div class="container">
  <h3>Create a Post</h3>


  <!--<form method="post" action= "" enctype="multipart/form-data">-->
    <div class="form-group">
      <label for="title" class="col-sm-12 control-label">Title</label>
      <div class="col-sm-11">
        <input type="text" class="form-control" v-model="title" name="title" placeholder="Add a title" value="">
      </div>
    
      <label for="message" class="col-sm-12 control-label">Description</label>
      <div class="col-sm-11">
	    <textarea type="text" class="form-control" rows="6" 
            v-model="contents" placeholder="Add a description"></textarea>
      </div>
     
      <label for="tag" class="col-sm-12 control-label">Tags</label>
      <div class="col-sm-11">
        <input type="text" class="form-control" v-model="tags" name="tag" placeholder="Add tag(s)" value="">
        <label for="prompt" class="col-sm-12 control-label">List tags as comma-separated list.</label>
      </div>
 
     
  
      <input class="box_file" type="file" name="files" id="file" data-multiple-caption="{count} files selected" multiple/>
      <label for="file"><strong>Choose a file</strong><span class="box_dragndrop"> or drop it here</span>.</label>
    </div>
    <div class="form-group">
      <div class="col-sm-2 pull-right">
        <input v-on:click="submitPost" class="btn btn-primary">
      </div>
    </div>
  <!--</form>-->
</div>


</body>
</template>


<script>
export default {
  name: 'PostCreate',
  data: function() {
    return {
      title: 'Title your post',
      contents: 'Give your post a description',
      tags: 'give your post some tags!',
      user: null
      
    }
  },
  methods: {
    getUser: function(){
      this.$store.dispatch('fetchUser', 1)
    },
    submitPost: function(event){
      var obj = {
        "user" : this.$store.state.user.url, 
        "title" : this.title, 
        "content" : "{plaintext:" + this.contents + "}",
        "likes" : 0,
        "comments" : [],
        "attachments" : [],
      }
      console.log(obj)
      this.$store.dispatch('createPost', obj)
    },
  },
  beforeMount(){
    this.getUser()
  }
}

</script>


<style>
.btn-primary {
    background: #41924B;
    color: #ffffff;
    border: 0 none;
}

.btn-primary:hover, .btn-primary:focus, .btn-primary:active, .btn-primary.active, .open > .dropdown-toggle.btn-primary {
    background: #295B2F;
}
/* navbar */
.navbar {
  min-height:100px !important;
}

/*buttons on navbar*/

.nav-navitems {
  text-align: center;
  padding-top: 30px;
}

/*search bar on naavbar */
.nav-searchpad {
  text-align: center;
  padding-top: 30px;
}

.box_dragndrop,
.box_uploading,
.box_success,
.box_error {
    display: none;
}

</style>
