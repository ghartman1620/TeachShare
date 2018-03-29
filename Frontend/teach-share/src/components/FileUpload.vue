<template>
    <div class="container">
        <!--UPLOAD-->
        <div class="row">
            <div class="col-12">
                
                <form enctype="multipart/form-data" novalidate multiple v-if="isInitial || isSaving">
                    <h1>{{title}}</h1>
                    <div class="dropbox">
                        <input
                            type="file"
                            ref="fileUpload"
                            multiple
                            name="files"
                            :disabled="isSaving || past_limit"
                            @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
                            :accept="accept"
                            :value="fileUploadValue"
                            class="input-file">
                            <p v-if="isInitial">
                                Drag your file(s) here to begin<br> or click to browse
                            </p>
                            <p v-if="isSaving">
                                Uploading {{ fileCount }} files...
                            </p>
                    </div>
                </form>
            </div>
            <div class="col">
                <br>
                <h4 v-if="this.$store.state.fs.files.length > 0">Uploaded files: </h4>
                <ul class="list-group">
                    <li v-bind:key="obj.file.name" v-for="obj in filesUploadStatus"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        <div class="col-5">
                            <span v-if="obj.url">
                                <a v-bind:href="'http://127.0.0.1:8000' + obj.url">{{ obj.file.name }}</a></span>
                            <span v-else>{{ obj.file.name }}</span>
                            </div>
                            <div v-on: class="col">
                            <div class="progress">
                                    <div class="progress-bar bg-success"
                                        role="progressbar"
                                        :style="{width: obj.percent + '%'}"
                                        :aria-valuenow="obj.percent"
                                        aria-valuemin="0"
                                        aria-valuemax="100">
                                            {{ obj.percent }}%
                                        </div>
                                </div>
                            </div>
                            <div class="col-1">
                                <button class="btn btn-sm btn-outline-danger" type="button" @click="removeItem(obj)">
                                    X
                                </button>
                            </div>
                    </li>
                </ul>
            </div> 
        </div>
    </div>
</template>

<!-- Typescript -->
<script lang="ts">

import { Vue } from "vue-property-decorator";
import { mapGetters, mapActions } from "vuex";
import { removeFile, uploadFiles, changeLimit, getFile, clearFiles } from "../store_modules/files/FileService"
import { Dictionary} from "vue-router/types/router.d";
import Component from 'vue-class-component';
// import * as vuetypes from "vue-router/types/vue.d";

var fileTypes = Object.freeze({
    FILE: "file/*",
    IMG: "image/*",
    VID: "video/*",
    AUD: "audio/*"
});

const UPLOAD_INITIAL = 0,
    UPLOAD_SAVING = 1,
    UPLOAD_SUCCESS = 2,
    UPLOAD_ERROR = 3;

@Component({
    props: {
        title: String,
        fileAcceptType: String,
        fileLimit: Number
    },
    computed: mapGetters("fs", [
        "filesUploadStatus",
        "allFilesUploadComplete",
        "past_limit"
    ]),
    methods: mapActions("fs", [
            "upload_file",
            "remove_file",
            "change_limit"
    ])
})
export default class FileUpload extends Vue {
    title;
    fileAcceptType;
    fileLimit;

    fileUploadValue: any = "";
    currentStatus: number = UPLOAD_INITIAL;
    fileCount: number = 0;

    get accept() {
        let t = (this.$route.query as Dictionary<string>).type;
        if (t) {
            return fileTypes[t];
        } else if (this.fileAcceptType) {
            return fileTypes[this.fileAcceptType];
        } else {
            return fileTypes["FILE"];
        }
    }
    get isInitial() {
        return this.currentStatus === UPLOAD_INITIAL;
    }
    get isSaving() {
        return this.currentStatus === UPLOAD_SAVING;
    }
    get isSuccess() {
        return this.currentStatus === UPLOAD_SUCCESS;
    }
    get isError() {
        return this.currentStatus === UPLOAD_ERROR;
    }
    get currentUploadedFiles() {
        return this.$store.state.fs.uploadedFiles;
    }
    getFile(id: string) {
        return getFile(this.$store)(id);
    }
    save(formData) {
        console.log(this);
        uploadFiles(this.$store, formData).then(resp => console.log("upload response: ", resp));
    }

    resetState() {
        this.currentStatus = UPLOAD_INITIAL;
    }
    filesChange(fieldName, fileList) {
        const formData = new FormData();
        if (!fileList.length) {
            return;
        }
        Array.from(Array(fileList.length).keys()).map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
        });
        this.save(formData);
        this.fileUploadValue = null;
    }
    removeItem(file) {
        var vm = this;
        console.log("get_file: ", this.getFile(file.pk));
        removeFile(this.$store, file).then(function() {
            vm.$parent.$emit("RemoveItem", file);
        });
    }

    mounted() {
        console.log(this);
        changeLimit(this.$store, this.fileLimit);
        if (this.$store.state.create.postElements.length > this.$route.query.index) {}
        this.resetState();
    }
    destroyed() {
        clearFiles(this.$store);
    }
}
</script>

<style lang="scss">
.dropbox {
    outline: 2px dashed grey;
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px;
    position: relative;
    cursor: pointer;
}

.input-file {
    opacity: 0;
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
}

.dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
}

.dropbox:hover {
    background: lightblue;
}

.progress {
    height: 30px;
    margin: auto;
}
</style>
