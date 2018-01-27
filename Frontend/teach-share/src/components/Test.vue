<template>
<div>
  <div>
    <h1 v-if="user">Hello, {{ user.username }}.</h1>
    <form v-on:submit.prevent="getUser">
      <input type="number" id="name" v-model="userid">
      <input type="submit" value="Submit">
    </form>
      <button v-on:click="testStore">Get Posts</button>
  </div>
  <div>
    <ul>
      <li v-for="post in posts" :key="post.pk">
      {{post.pk}}.) <strong>Title: {{ post.title }}</strong> ==> Content: {{ post.content }}
      </li>
    </ul>
    <form v-on:submit.prevent="getComment">
      <input type="number" id="name" v-model="commentid">
      <input type="submit" value="Submit">
    </form>
    <h3 v-if="comment">{{comment.text}}</h3>
  </div>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data: function() {
    return {
      userid: '',
      commentid: '',
    }
  },
  computed: {
    posts: {
      get: function(){
        return this.$store.state.posts;
      },
      set: function(newValue){
        // placeholder, does not work
      }
    },
    user: {
      get: function(){
        return this.$store.state.user;
      },
      set: function(newUser){
        // placeholder, does not work
      }
    },
    comment: {
      get: function(){
        return this.$store.state.comment;
      },
      set: function(newUser){
        // placeholder, does not work
      }
    }
  },
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
    testStore(){
      this.$store.dispatch('fetchAllPosts');
    }
  }
}
</script>

