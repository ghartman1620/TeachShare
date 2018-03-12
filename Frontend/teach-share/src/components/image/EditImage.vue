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

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import ImageElement from "./ImageElement";
import DimensionPicker from "../DimensionPicker";

var _ = require("lodash");

export default Vue.component("edit-image", {
    components: { FileUpload, ImageElement, DimensionPicker },
    props: [],
    data() {
    return {
            title: "",
            description: "",
            height: 480,
            width: 640
        };
    },
    computed: {
        ...mapGetters(["hasFiles", "allFilesUploadComplete"])
    },
    methods: {
        submit() {
            var vm = this;
            if (this.$route.query.index === this.$store.state.create.postElements.length) {
                this.$store.dispatch("addElement", this.generateJSON())
                    .then(function(){
                        vm.$router.push({name: "create"});
                });
            } else {
                this.$store.dispatch("editElement", {
                    index: this.$route.query.index,
                    component: this.generateJSON()
                }).then(function(){
                    vm.$router.push({name: "create"});
                });
            }
            // this.$store.dispatch("LoadImages", this.generateJSON());
            // this.$router.push({name: "create"});
        },
        generateJSON() {
            let output = new Array();
            var vm = this;
            _.map(this.$store.state.fs.uploadedFiles, function(val, ind, arr) {
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
                content: output,
                width: this.width,
                height: this.height  
            };
        },
        cancelEdit() {
            this.$router.push({ name: "create" });
        }
    },
    mounted() {
        this.$on("changeHeight", function(h) {
            this.height = h;
        });
        this.$on("changeWidth", function(w) {
            this.width = w;
        });
    }
});
</script>



<style lang="scss" scoped>
.card {
    padding: 10px;
}
</style>

