<template>
    <div>
        <div class="card">
            <form v-on:submit.prevent="submitAudio">

                <!-- file upload -->
                <file-upload :fileLimit="1" title="Upload Audio Files" fileAcceptType="AUD"></file-upload>
                <br><br>
                
                <!-- Title -->
                <div class="row">
                    <div class="col-12">
                    <div class="input-group">
                        <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-height">Title</span>
                        </div>
                        <input
                        v-model="title"
                        type="text"
                        class="form-control"
                        name="height"
                        aria-describedby="basic-height">
                    </div>
                    </div>
                    <br><br><br>
                </div>
                <br>
                <h4>Audio Description(s) (optional):</h4>

                <!-- Description -->
                <textarea v-model="description" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                <br>
 

                <div class="row">
                    <div class="offset-3 col-6">
                        <button @click.prevent="submit" type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
                            <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
                            <span v-else>Submit Audio(s)</span>
                        </button>
                    </div>
                    <div class="col-2">
                        <button @click="close" type="button" class="btn btn-danger btn-block">
                                Cancel
                        </button>
                    </div>
                </div>
                
            </form>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import AudioElement from "./AudioElement";

var _ = require("lodash");

export default Vue.component("edit-audio", {
    components: { FileUpload, AudioElement },
    props: [],
    data() {
        return {
            title: "",
            description: ""
    };
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
                description: vm.description});
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
});
</script>



<style lang="scss" scoped>
.card {
  padding: 10px;
}
</style>

