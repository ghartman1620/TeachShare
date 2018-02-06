<template>
<body>
<input v-model="text">
<button v-on:click="submit">Submit.</button>
<button v-on:click="close">X</button>

</body>
</template>

<script>
import Vue from "vue";
export default Vue.component("edit-text", {
    data() {
      return {
        text: "",
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