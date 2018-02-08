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
        if(this.index == this.$store.state.inProgressPostComponents.length){
          this.$store.dispatch("addComponent", {
            "type": "text",
            "contents": this.component.contents,
          });
        }
        else{
          this.$store.dispatch("editComponent", {
            "index" : this.index,
            "component": this.component
          });
        }
        this.$store.dispatch("changeEditedComponent", "");
        
      },
      close: function(event){
      
        this.$store.dispatch("changeEditedComponent", "");
        console.log("close");
      }
    }
  })
</script>