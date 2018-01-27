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
  </div>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data: function() {
    return {userid: ''}
  },
  computed: {
    posts: {
      get: function(){
        return this.$store.state.posts;
      },
      set: function(newValue){  // placeholder, does not work
        newValue = this.$store.state.posts;
      }
    },
    user: {
      get: function(){
        return this.$store.state.user;
      },
      set: function(newUser){ // placeholder, does not work
        newUser = this.$store.state.user;
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
    testStore(){
      this.$store.dispatch('fetchAllPosts');
      this.message = this.$store.state.post;
    }
  }
}
</script>

