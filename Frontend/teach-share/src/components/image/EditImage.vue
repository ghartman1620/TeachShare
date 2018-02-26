<template>
<div>
    <div class="container card">
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
                    <router-link :to="{name: 'create'}">
                    <button @click="submit" type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
                        <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
                        <span v-else>Submit Image(s)</span>
                    </button>
                    </router-link>
                </div>
                <div class="col-2">
                    <router-link :to="{name:'create'}">

                    <button type="button" class="btn btn-danger btn-block" @click.prevent="cancelEdit">
                    Cancel
                    </button>
                    </router-link>
                </div>
            </div>
        </form>
    </div>
    <br>
    <br>
    <div class="row">
        <div class="col-2"></div>
        <div class="col-8" v-if="this.$store.state.image.images.length > 0">
            <image-element 
                :images=this.$store.state.image.images
                :body="description"
                :title="title">
            </image-element>
        </div>
        <div class="col-2"></div>
    </div>
    <br><br>
    {{allFilesUploadComplete}}
</div>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import ImageElement from "./ImageElement";

var _ = require("lodash");

export default Vue.component("edit-image", {
    components: { FileUpload, ImageElement },
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
            if (
                this.$route.query.index ==
                this.$store.state.create.postElements.length
            ) {
                this.$store.dispatch("addElement", this.generateJSON());
            } else {
                this.$store.dispatch("editElement", {
                    index: this.$route.query.index,
                    component: this.generateJSON()
                });
            }

            console.log(this.title);
            console.log(this.description);
            this.$store.dispatch("LoadImages", this.generateJSON());
        },
        generateJSON() {
            let output = new Array();
            var vm = this;
            _.map(this.$store.state.fs.uploadedFiles, function(val, ind, arr) {
                console.log(val, ind, arr);
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
            console.log(output);
            return { type: "image_file", description: this.description, title: this.title, content: output };
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
    },
    created() {
		this.$store.dispatch("openEditor");
	},
	destroyed() {
		this.$store.dispatch("closeEditor");
	}
});
</script>



<style lang="scss" scoped>

</style>

