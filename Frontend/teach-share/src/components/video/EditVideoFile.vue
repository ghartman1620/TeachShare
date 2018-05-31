<template>
    <div>
        <form v-on:submit.prevent="submit">
            <file-upload :fileLimit="1" title="Upload Video Files" fileAcceptType="VID"></file-upload>
            <br>
            <div class="row">
                <div class="col-12">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-height">Title</span>
                        </div>
                        <input
                            v-model="ActualTitle"
                            type="text"
                            class="form-control"
                            name="height"
                            aria-describedby="basic-height">
                    </div>
                </div>
                <br><br><br>
                <div class="col-12">
                    <br>
                    <!-- dimension picker -->
                    <dimension-picker></dimension-picker>
                </div>
            </div>
            <br>
            <h4>
                Video Description(s) (optional) :
            </h4>
            <textarea v-model="fileDescription" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            <br>
            <div class="row">
            <div class="offset-3 col-6">
                    <button type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
                        <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
                        <span v-else>Submit Video(s)</span>
                    </button>
                </div>
                <div class="col-2">
                        <button type="button" class="btn btn-danger btn-block" @click.prevent="cancelEdit">
                                Cancel
                        </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import FileUpload from "../FileUpload.vue";
import DimensionPicker from "../DimensionPicker.vue";
import { mapGetters } from "vuex";
import { Component } from "vue-property-decorator";
import { clearFiles } from "../../store_modules/FileService";

import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";


var _ = require("lodash");

@Component({
    name: "edit-video-file",
    components: { FileUpload, DimensionPicker },
})
export default class EditVideoFile extends Vue{
    @Getter("fs/hasFiles") hasFiles;
    @Getter("fs/allFilesUploadComplete") allFilesUploadComplete;
    @Getter("fs/files") files;

    width: number = 640;
    height: number = 480;
    title: string = "";
    source: string = "";
    fileDescription: string = "";


    get ActualTitle() {
        return this.title;
    }
    set ActualTitle(val: string) {
        this.title = val;
    }


    // DebounceFileSubmit: _.throttle(function() {
    //     this.genDebounceerateFileJSON();
    // }, 1000),
    submit() {
        this.$parent.$emit("submitElement", this.generateFileJSON(), this.$route.query.index);
        this.$router.push({name: "create"});
    }
    generateFileJSON() {
        let val = this.files.list()[0];
        var obj = {
            post: 2,
            type: "video_file",
            id: val.db_id,
            height: this.height,
            title: this.ActualTitle,
            width: this.width,
            file: val.file,
            name: val.file.name,
            url: val.url,
            description: this.fileDescription
        };
        return { type: "video_file", content: obj };
    }
    cancelEdit() {
        this.$router.push({ name: "create" });
    }
    mounted() {
        var vm: EditVideoFile = this;
        vm.$on("changeHeight", function(h) {
            vm.height = h;
        });
        vm.$on("changeWidth", function(w) {
            vm.width = w;
        });
    }
    destroyed() {
        clearFiles(this.$store);
    }
};
</script>



<style lang="scss" scoped>
.fade-transition {
    transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave {
    opacity: 0;
}
</style>

