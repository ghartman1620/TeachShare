<template>
  <body>

  <!--We can use any buttons we want in the toolbar!
  Check out the github for more examples, and the
  exact code needed for other types of buttons -->
  <div class="custom-quill-editor">
    <quill-editor
       v-model="component.content"
       :options="editorOption"
       @blur="onEditorBlur($event)"
       @focus="onEditorFocus($event)"
       @ready="onEditorReady($event)">
      <div id="toolbar" slot="toolbar">
        <!-- Add a bold button -->
        <button class="ql-bold">Bold</button>
        <button class="ql-italic">Italic</button>
        <!-- Add font size dropdown -->
        <select class="ql-size">
          <!-- Note a missing, thus falsy value, is used to reset to default -->
          <option selected></option>
          <option value="large"></option>
          <option value="huge"></option>
        </select>
        <select class="ql-font">
          <option selected="selected"></option>
          <option value="serif"></option>
          <option value="monospace"></option>
        </select>
        <!-- You can also add your own
        <button id="custom-button" @click="customButtonClick">[ Click me ]</button-->
      </div>
    </quill-editor>


    <div class="quill-code">
    </div>
  </div>
<router-link :to="{ name: 'create'}"><button v-on:click="submit">Submit.</button></router-link>
<router-link :to="{name: 'create'}"><button>close</button></router-link>

</body>
</template>

<script>
import Vue from "vue";
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { mapState } from "vuex";
Vue.use(VueQuillEditor,)

export default Vue.component("edit-text", {
    data() {
      return {
        component: {},
        editorOption: {
          modules: {
            toolbar: '#toolbar'
          }
        } //sooooooooo many options to pass for customizing the editor.
      }
    },
    computed: {


    },

    methods: {
      submit: function(event){
        if(this.$route.query.index == this.$store.state.create.postComponents.length){
          this.$store.dispatch("addComponent", this.component);
        }
        else{
          this.$store.dispatch("editComponent", {
            "index" : this.$route.query.index,
            "component": this.component
          });
        }
        
      },
      close: function(event){

        console.log("close");
      },

    },
    mounted(){
      this.$router.replace({name: 'edit-text', query: {index: this.$route.query.index}})
      console.log("mounted edit text");
      if(this.$route.query.index >= this.$store.state.create.postComponents.length){
        this.component = {
          type: "text",
          content: "",
        }
      }else{
        this.component = Object.assign({}, this.$store.state.create.postComponents[this.$route.query.index]);
      }
    },
    beforeDestroy(){
      console.log("destroy");
    }
  })
</script>

<style lang="scss" scoped>

  .quill-editor,
  .quill-code {
    width: 50%;
  }

  .quill-code {
    border: none;
    height: auto;
  }

  body{
    background: #ffffff;
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
