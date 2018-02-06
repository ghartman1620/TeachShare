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
    props: ['component', 'index'],
    data() {
      return {
        text: "",
      }
    },
    methods: {
      submit: function(event){
        this.$store.dispatch("editComponent", {
          "index": this.index,
          "component" : {
            "type": "text",
            "contents": this.component.contents,
          }});
        this.$store.dispatch("changeEditedComponent", "");
      },
      close: function(event){
      
        this.$store.dispatch("changeEditedComponent", "");
        console.log("close");
      }
    }
  })
</script>