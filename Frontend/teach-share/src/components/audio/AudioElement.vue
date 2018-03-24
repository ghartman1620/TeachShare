<template>
<div>
    <div :style="{width: cardWidth + 'px', padding: '10px'}">
        
        <b-card>
            <b-container>
                <b-row>
                    <!-- TODO: make this have 100% width -->
                    <b-col> 
                        <audio 
                            :id="id"
                            :src="url"
                            :type="filetype"
                            :controls="controls">
                        </audio>
                    </b-col>
                   
                </b-row>
                <b-row>
                    <b-col>
                        <h4>
                            {{ localTitle }}
                        </h4>
                        <p>
                            {{localBody}}
                        </p>
                    </b-col>
                </b-row>

            </b-container>
        </b-card>
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
