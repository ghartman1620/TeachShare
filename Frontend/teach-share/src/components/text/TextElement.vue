<template>
        <p v-html="element.content"></p>
</template>

<script lang="ts">
import Vue from "vue";
import VueQuillEditor from "vue-quill-editor";
require("quill/dist/quill.core.css");
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
Vue.use(VueQuillEditor);
import { Component, Prop } from "vue-property-decorator";

@Component({
    name: "text-element",
    props: ["element"]
})
export default class TextElement extends Vue{
    @Prop({}) element: any;
};
</script>

<style>
.ql-syntax {
    background-color: #23241f;
    color: #f8f8f2;
    overflow: visible;
}

.ql-size-huge {
    font-size: 30px;
}
.ql-size-large {
    font-size: 20px;
}
.ql-font-monospace {
    font-family: "Courier";
}
.ql-font-serif {
    font-family: "Times New Roman", Times, serif;
}

.ql-align-right {
    text-align: right;
}
.ql-align-center {
    text-align: center;
}
.ql-align-justify {
    text-align: justify;
}
</style>