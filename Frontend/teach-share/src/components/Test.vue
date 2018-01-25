<template>
  <h1>{{req}}</h1>
</template>

<script>
export default {
  name: 'Test',
  data: {
    req: '',
  },
  mounted: function(){
    this.req = fetch('http://localhost:8000/api/posts/1/')
    .then(function(resp){
      return resp.json();
    }).catch(err => console.error('Error', err))
  },
  methods: {
    loadPost(){

    }
  }
}
</script>

