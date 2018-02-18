<template>
<body>
<p> I'm a text view component! </p>
<p v-html="component.content"></p>
</body>

</template>

<script>
import Vue from "vue";

import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor, );
export default Vue.component("view-text", {
  props: ['component'],
  })
</script>

<style>
.ql-size-huge {
  font-size: 30px;
}
.ql-size-large {
  font-size: 20px;
}

.ql-font-monospace {
  font-family: "Courier" ;
}
.ql-font-serif {
  font-family: "Times New Roman", Times, serif;
}

</style>