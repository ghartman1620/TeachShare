<template>
  <div>
    <h1>{{ message }}</h1>
    <button v-on:click="loadPost">Load Post</button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data: function() {
    return {
      message: 'This is a message.'
    }
  },
  methods: {
    loadPost(){
      console.log('beginning fetch');
      fetch('http://localhost:8000/api/posts/1/')
      .then(resp => resp.json())
      .then(resp => this.message = resp)
      .catch(err => console.error('Error', err))
    }
  }
}
</script>

