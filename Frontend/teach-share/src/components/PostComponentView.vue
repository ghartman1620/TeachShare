<!--
This component views a single post component. Used in PostCreate and PostFeed.
Uses ViewText, ViewVideo, etc.
-->

<template>
<body>
<div class="post-component card" v-if="component.type === 'text'">
    <view-text :component="component"></view-text>
</div>
<div class="post-component card" v-else-if="component.type === 'image'">
    <p>An image component!</p>  
</div>
<div class="post-component card" v-else-if="component.type === 'audio'">
    <p>An audio component!</p>  
</div>
<div class="post-component card" v-else-if="component.type === 'video'">
    <p>A video component!</p>  
</div>
<div class="post-component card" v-else>
    <p>A file component!</p>  
</div>

</body>
</template>

<script>
import Vue from "vue";
import ViewText from "./ViewText"
//add other view components as appropriate

export default Vue.component("post-component", {
    props: ['component'],
});
</script>