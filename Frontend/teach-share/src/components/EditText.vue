<template>
<body>
<input v-model="component.contents">
<button v-on:click="submit">Submit.</button>
<button v-on:click="close">X</button>

</body>
</template>

<script>
import Vue from "vue";
export default Vue.component("edit-text", {
    props: ['component'],
    data() {
      return {
      }
    },
    methods: {
      submit: function(event){
        this.$store.dispatch("addComponent", {
          "type": "text",
          "contents": this.text,
        });
        this.$store.dispatch("changeEditedComponent", "");
        
      },
      close: function(event){
      
        this.$store.dispatch("changeEditedComponent", "");
        console.log("close");
      }
    }
  })
</script>