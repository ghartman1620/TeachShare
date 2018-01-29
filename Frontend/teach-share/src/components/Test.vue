<template>
<div>
  <div>
    <h1 v-if="user">Hello, {{ user.username }}.</h1>
    <form v-on:submit.prevent="getUser">
      <input type="number" id="name" v-model="userid">
      <input type="submit" value="Submit">
    </form>

  </div>
  <div>
    <br><br>

    <!-- Getting all the json for all the posts, using a demo component -->
    <h2>Posts:</h2>
    <button v-on:click="getPostsByMyUser">Get Posts By User Selected</button>
    <button v-on:click="testStore">Get Posts</button>

    <h1>HEY</h1>
    <!-- This is how you use components, you can just put them in the markup -->
    <list-component :items='posts'></list-component>
    <!--  -->

    <br><br>

    <!-- Getting comments by primary key (pk) -->
    <h2>Comments:</h2>
    <form v-on:submit.prevent="getComment">
      <input type="number" id="name" v-model="commentid">
      <input type="submit" value="Submit">
    </form>
    <h3 v-if="comment">{{comment.text}}</h3>
    <br><br>

    <!-- Getting a post by it's primary key (pk) -->
    <h2>Post:</h2>
    <form v-on:submit.prevent="getPost">
      <input type="number" id="name" v-model="postid">
      <input type="submit" value="Submit">
    </form>
    <h3 v-if="post">{{post}}</h3>

    <!-- Getting comments for a particular post by it's primary key (pk) -->
    <h2>Comments for post:</h2>
    <form v-on:submit.prevent="getCommentsForPost">
      <input type="number" id="name" v-model="postid">
      <input type="submit" value="Submit">
    </form>
    <h3 v-if="comments.length">{{comments}}</h3>
  </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ListComponent } from './ListComponent';

export default {
  components: ListComponent,
  name: 'Test',
  data: function() {
    return {
      userid: '',
      commentid: '',
      postid: ''
    }
  },
  computed: mapState({
    post: state => state.post,
    posts: state => state.posts,
    user: state => state.user,
    comment: state => state.comment,
    comments: state => state.comments
  }),
  methods: {
    loadPost(){
      console.log('beginning fetch');
      fetch('http://localhost:8000/api/posts/1/')
      .then(resp => resp.json())
      .then(resp => this.message = resp)
      .catch(err => console.error('Error', err))
    },
    getUser(){
      this.$store.dispatch('fetchUser', this.userid);
    },
    getComment(){
      this.$store.dispatch('fetchComment', this.commentid);
    },
    getPost(){
      this.$store.dispatch('fetchPost', this.postid);
    },
    testStore(){
      this.$store.dispatch('fetchAllPosts');
    },
    getPostsByMyUser(){
      console.log(this.userid);
      this.$store.dispatch('fetchFilteredPosts', this.userid);
    },
    getCommentsForPost(){
      this.$store.dispatch('fetchCommentsForPost', this.postid)
    }
  }
}
</script>

