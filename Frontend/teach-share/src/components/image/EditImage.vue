<template>
<div>
    <b-card>
        <form v-on:submit.prevent="submit">
            <!-- file upload -->
            <file-upload :fileLimit="20" title="Upload Image Files" fileAcceptType="IMG"></file-upload>
            <br><br>

            <!-- Title -->
            <b-row>
                <b-col>
                    <b-input-group prepend="Title">
                        <b-input
                            v-model="title"
                            type="text"
                            name="height"
                            aria-describedby="basic-height"/>
                    </b-input-group>
                    <br>
                </b-col>   
            </b-row>
            <b-row>
                <b-col>
                    <dimension-picker/>
                </b-col>
            </b-row>
            <br><br>
            <h4>Image Description(s) (optional):</h4>

            <!-- Description -->
            <textarea v-model="description" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            <br>
            <submit-close-editor
                @submit="submit"
                @close="cancelEdit"
                :disabled="!allFilesUploadComplete"
                type="image"
                disableMessage="Please Select Image(s) to upload"
            />

        </form>
    </b-card>


</div>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import ImageElement from "./ImageElement";
import DimensionPicker from "../DimensionPicker";
import SubmitCloseEditor from "../SubmitCloseEditor";

var _ = require("lodash");

export default Vue.component("edit-image", {
    components: { FileUpload, ImageElement, DimensionPicker, SubmitCloseEditor },
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

