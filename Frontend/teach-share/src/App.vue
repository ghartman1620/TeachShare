<!--Very very barebones. This will be improved shortly! -JL -->

<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

const ModuleGetter = namespace("audio", Getter)

@Component({
    props: {},
})
export default class App extends Vue {
    @ModuleGetter("") imageModule
    @State("audio") stateAudio;
    @Action("audio/submitAudioFiles") submit;
    mounted() {
        console.log(ModuleGetter);
        console.log(this.submit());
        this.submit().then((res)=> console.log(res));
        console.log(this.stateAudio);
    }

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
