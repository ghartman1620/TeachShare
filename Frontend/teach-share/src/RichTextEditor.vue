
<!-- This is just the editor component, to get source dependencies just run npm install -->

< link href="https://cdn.quilljs.com/1.3.5/quill.snow.css" rel="stylesheet">

<head>
  <title>Bootstrap Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

</head>

<template>
  <!-- bidirectional data binding -->
  <div class="quill-editor"
       v-model="content">
    <quill-editor ref="myTextEditor"
                  v-model="content">

    </quill-editor>
    <div class="quill-code">
    </div>
  </div>

</template>

<script>
  import Vue from 'vue'
  import VueQuillEditor from 'vue-quill-editor'

  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  Vue.use(VueQuillEditor, )

  export default {
    data() {
      return {
        content: '<p>example content</p>',
        editorOption: {}
      }
    },
    mounted() {
      console.log('this is current quill instance object', this.myQuillEditor)
    },
    methods: {
      onEditorBlur(editor) {
        console.log('editor blur!', editor)
      }
    }
  }

</script>

<style lang="scss" scoped>

  .quill-code {
    border: none;
    height: auto;
  }

  body{
    background: #e5ffee;
    /*background: -webkit-linear-gradient(right, #e5ffee, #e5ffee); Might be cool to use later, or for other components? - JL
    background: -moz-linear-gradient(right, #e5ffee, #e5ffee);
    background: -o-linear-gradient(right, #e5ffee, #e5ffee);
    background: linear-gradient(to left, #e5ffee, #e5ffee);*/
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>




