<template>
<div>
    <div style="width: 100%; padding: 10px;">
        <div class="card-body">
            <audio
                class="col-12"
                :src="url()"
                :type="element.filetype"
                :controls="url()">
            </audio>
            <br><br>
            <h4 class="card-title">{{ element.title }}</h4>
            <p class="card-text">
                {{element.description}}
            </p>
        </div>
    </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import { Component, Prop } from "vue-property-decorator";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    name: "audio-element",
})
export default class AudioElement extends Vue{
    @Prop({})
    element!: any;

    url(): string {
        return `http://localhost:8000${this.element.url}`;
    }
    mounted() {
        console.log(this.element);
        console.log(this.url());
    }

};
</script>
