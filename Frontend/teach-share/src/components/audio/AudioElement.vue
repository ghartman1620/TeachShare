<template>
<div>
    <div :style="{width: cardWidth + 'px', padding: '10px'}">
        <div class="card-body">
            <audio
                class="col-12"
                :id="id"
                :src="url"
                :type="filetype"
        :controls="controls">
            </audio>
            <br><br>
            <h4 v-if="!editing" class="card-title">{{ localTitle }}</h4>
            <input @change.prevent="changedTitle" class="col-12" v-if="editing" v-model="localTitle" type="text">
            <p v-if="!editing" class="card-text">
                {{localBody}}
            </p>
            <textarea class="col-12" @change.prevent="changedBody" v-if="editing" v-model="localBody" rows="3"></textarea>
            <div class="row">
                <div class="col-auto mr-auto"/>
                <div class="col-auto">
                    <button type="button" @click.prevent="ToggleEditText" class="btn btn-warning">Edit</button>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.component("audio-element", {
    props: [
        "id",
        "title",
        "body",
        "controls",
        "source",
        "filetype",
        "autoplay"
    ],
    data() {
        return {
            audio: null,
            editing: false,
            localTitle: this.title,
            localBody: this.body
        };
    },
    computed: {
        cardWidth: function() {
            return parseInt(this.width) + 20;
        },
        url: function() {
            return `http://localhost:8000${this.source}`;
        }
    },
    mounted: function() {
        this.audio = document.getElementById(this.id);
    },
    methods: {
        // basic play functionality (not needed)
        Play() {
            console.log("play");
            this.audio.play();
        },
        Pause() {
            console.log("pause");
            this.audio.pause();
        },
        ToggleEditText() {
            console.log("editing text!")
            this.editing = !this.editing;
        },
        changedTitle() {
            console.log("emit!");
            this.$parent.$emit("changedTitle", this.localTitle);
        },
        changedBody() {
            console.log("emit!");
            this.$parent.$emit("changedBody", this.localBody);
        }
    }
});
</script>
