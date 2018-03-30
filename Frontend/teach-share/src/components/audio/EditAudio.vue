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

<script lang = "ts">
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import { Component } from "vue-property-decorator";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

var _ = require("lodash");

@Component({
    name: "edit-audio",
    components: { FileUpload },
    props: [],
    
})
export default class EditAudio extends Vue{
    @State("create") postState;
    @State("fs") fileState;
    @Action("addElement") addElement;
    @Action("editElement") editElement;
    @Action("submitAudioFiles") submitAudioFiles;
    @Getter("fs/allFilesUploadComplete") allFilesUploadComplete;
    @Getter("fs/hasFiles") hasFiles;
    @Getter("fs/files") files;
    title: string = "";
    description: string = "";

    // getters


    created() {
        var vm: EditAudio = this; //to get rid of this implicitly has type any
        vm.$on("changedTitle", function(res) {
            vm.title = res;
        });
        vm.$on("changedBody", function(res) {
            vm.description = res;
        });
    }
    // methods
    submitAudio() {
        this.submitAudioFiles(this.generateJSON());
    }
    generateJSON() {
        var val = this.files.objectify()[0]; //one file max in audio elements
        return  {
            type: "audio_file",
            id: val.db_id,
            title: this.title,
            filetype: val.file.type,
            name: val.file.name,
            url: val.url,
            description: this.description
        };
    }
    submit() {
        this.$parent.$emit("submitElement", this.generateJSON(), this.$route.query.index);
    }
    close(event: any) {
        this.$router.push({ name: "create" });
    }
    
};
</script>



<style lang="scss" scoped>
.card {
  padding: 10px;
}
</style>

