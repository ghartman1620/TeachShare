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
            <h4 class="card-title">{{ localTitle }}</h4>
            <p class="card-text">
                {{localBody}}
            </p>
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
            this.audio.play();
        },
        Pause() {
            this.audio.pause();
        },
        ToggleEditText() {
            this.editing = !this.editing;
        },
        changedTitle() {
            this.$parent.$emit("changedTitle", this.localTitle);
        },
        changedBody() {
            this.$parent.$emit("changedBody", this.localBody);
        }
    }
});
</script>
