<template>
<div>
    <div class="card">
        <form v-on:submit.prevent="submit">
            <!-- file upload -->
            <file-upload :fileLimit="20" title="Upload Image Files" fileAcceptType="IMG"></file-upload>
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
                <div class="col-12">
                    <br>
                    <dimension-picker></dimension-picker>
                </div>
            </div>
            <br><br>
            <h4>Image Description(s) (optional):</h4>

            <!-- Description -->
            <textarea v-model="description" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            <br>
            <div class="row">
                <div class="offset-3 col-6">
                    <button @click.prevent="submit" type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
                        <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
                        <span v-else>Submit Image(s)</span>
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


</div>
</template>

<script lang = "ts">
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import DimensionPicker from "../DimensionPicker";
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
    name: "edit-image",
    components: { FileUpload, DimensionPicker },
    props: [],
    
})
export default class EditImage extends Vue{
    @State("create") postState;
    @State("fs") fileState;
    @Action("addElement") addElement;
    @Action("editElement") editElement;
    @Getter("fs/allFilesUploadComplete") allFilesUploadComplete;
    @Getter("fs/files") files;

    title: string = "";
    description: string = "";
    height: number = 480;
    width: number = 640;
    
    // getters
    get hasFiles(){
        return this.$store.getters.hasFiles;
    }
   
    mounted() {
        var vm: EditImage = this; //get rid of "this implicitly has type any"
        vm.$on("changeHeight", function(h) {
            vm.height = h;
        });
        vm.$on("changeWidth", function(w) {
            vm.width = w;
        });
    }
    // methods
    submit() {
        this.$parent.$emit("submitElement", this.generateJSON(), this.$route.query.index);
        // this.$store.dispatch("LoadImages", this.generateJSON());
        // this.$router.push({name: "create"});
    }
    generateJSON() {
        let output = new Array();
        var vm = this;
        _.map(this.fileState.uploadedFiles, function(val, ind, arr) {
            output.push({
                post: 2,
                type: "image_file",
                id: val.db_id,
                title: vm.title,
                file: val.file,
                name: val.file.name,
                url: val.url,
                description: vm.description
            });
        });
        return { 
            type: "image_file", 
            description: this.description, 
            title: this.title, 
            content: this.files.objectify(),
            width: this.width,
            height: this.height  
        };
    }
    cancelEdit() {
        this.$router.push({ name: "create" });
    }
    
};
</script>



<style lang="scss" scoped>
.card {
    padding: 10px;
}
</style>

