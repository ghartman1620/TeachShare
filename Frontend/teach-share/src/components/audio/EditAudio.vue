<template>
    <div>
        <b-card>
            <b-form v-on:submit.prevent="submitAudio">
                <!-- file upload -->
                <file-upload :fileLimit="1" title="Upload Audio Files" fileAcceptType="AUD"></file-upload>
                <br><br>
                <!-- Title -->
                <b-row>
                    <b-col>
                    <b-input-group prepend="Title">

                        <b-form-input
                        v-model="title"
                        type="text"
                        name="height"
                        aria-describedby="basic-height"/>
                    </b-input-group>
                    </b-col>
                    <br><br><br>
                </b-row>
                <br>
                <h4>Audio Description(s) (optional):</h4>

                <!-- Description -->
                <b-form-textarea v-model="description" id="exampleFormControlTextarea1" :rows="3"></b-form-textarea>
                <br>
                <submit-close-editor
                    @submit="submit"
                    @close="close"
                    :disabled="!allFilesUploadComplete"
                    disableMessage="Please upload an audio or wait for audio to finish uploading"
                    type="audio"
                />
            </b-form>
        </b-card>
    </div>                
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import AudioElement from "./AudioElement";
import SubmitCloseEditor from "../SubmitCloseEditor";

var _ = require("lodash");

export default Vue.component("edit-audio", {
    components: { FileUpload, AudioElement, SubmitCloseEditor },
    props: [],
    data() {
        return {
            title: "",
            description: ""
        }
    },
    computed: {
        changedTextRecv() {},
        ...mapGetters(["hasFiles", "allFilesUploadComplete"])
    },

    methods: {
        submitAudio() {
            this.$store.dispatch("submitAudioFiles", this.generateJSON());
        },
        generateJSON() {
            let output = new Array();
            var vm = this;
            _.map(this.$store.state.fs.uploadedFiles, function(val, ind, arr) {
            output.push({
                post: 2,
                type: "audio_file",
                id: val.db_id,
                title: vm.title,
                filetype: val.file.type,
                name: val.file.name,
                url: val.url,
                description: vm.description})
            });
            return output;
        },
        submit() {
            var vm = this;
            if (this.$route.query.index === this.$store.state.create.postElements.length) {
                this.$store.dispatch("addElement", {
                    type: "audio",
                    content: this.generateJSON()
                }).then(function(){
                    vm.$router.push({name: "create"});
                });
            } else {
                this.$store.dispatch("editElement", {
                    index: this.$route.query.index,
                    element: { type: "audio", content: this.generateJSON() }
                }).then(function(){
                    vm.$router.push({name: "create"});
                });
            }
        },
        close: function(event) {
            this.$router.push({ name: "create" });
        }
    },

    created() {
        this.$on("changedTitle", function(res) {
            this.title = res;
        });
        this.$on("changedBody", function(res) {
            this.description = res;
        });
    }
}
);
</script>



<style lang="scss" scoped>

</style>

