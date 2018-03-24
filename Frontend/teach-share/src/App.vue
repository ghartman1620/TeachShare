<!--Very very barebones. This will be improved shortly! -JL -->

<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

export default class App extends Vue {

};
</script>

<style lang="scss">
@import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>

<style lang="scss">
$main-font: "Roboto", sans-serif;
@mixin antialiased {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
$background-color: #E5FFEE;

body{
    font-family: $main-font;
    background-color: $background-color;
    @include antialiased;
}
</style>
