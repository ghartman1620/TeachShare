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
                            :disabled="isSaving || pastLimit"
                            @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
                            :accept="accept"
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
                <h4 v-if="this.$store.state.fs.uploadedFiles.length > 0">Uploaded files: </h4>
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

<!-- Javascript -->
<script>
/*
Known issues with frontend upload (backend in posts/views.py):
If a file upload is in progress and you exit the file upload compoennt and re-enter it,
the file will resume progress uploading (clicking cancel should cancel/remove all file uploads)

If multiple files are in progress uploading and the first is clicked to cancel the final one will be 
cancelled sometimes

*/
import Vue from "vue";
import { mapGetters } from "vuex";

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

export default Vue.component("file-upload", {
  components: {},
  //file/*
  props: ["title", "fileAcceptType", "fileLimit"],
  data() {
    return {
      currentStatus: null
    };
  },
  computed: {
    accept() {
      if (this.$route.query.type) {
        return fileTypes[this.$route.query.type];
      } else if (this.fileAcceptType) {
        return fileTypes[this.fileAcceptType];
      } else {
        return fileTypes["FILE"];
      }
    },
    isInitial() {
      return this.currentStatus === UPLOAD_INITIAL;
    },
    isSaving() {
      return this.currentStatus === UPLOAD_SAVING;
    },
    isSuccess() {
      return this.currentStatus === UPLOAD_SUCCESS;
    },
    isError() {
      return this.currentStatus === UPLOAD_ERROR;
    },
    currentUploadedFiles() {
      return this.$store.state.fs.uploadedFiles;
    },
    ...mapGetters(["filesUploadStatus", "allFilesUploadComplete", "pastLimit"])
  },
  methods: {
    save(formData) {
      this.$store.dispatch("fileUpload", formData);
    },
    resetState() {
      this.currentStatus = UPLOAD_INITIAL;
      this.uploadError = null;
    },
    filesChange(fieldName, fileList) {
      console.log(fieldName, fileList);
      const formData = new FormData();
      if (!fileList.length) {
        console.log("fileList is empty");
        return;
      }
      Array.from(Array(fileList.length).keys()).map(x => {
        formData.append(fieldName, fileList[x], fileList[x].name);
      });
      this.save(formData);
      this.$refs.fileUpload.value = null;
      console.log("in filesChange2");
    },
    removeItem(file) {
      console.log(file);
      var vm = this;
      this.$store.dispatch("removeFile", file).then(function() {
        vm.$parent.$emit("RemoveItem", file);
      });
    }
  },
  mounted() {
    this.$store.dispatch("changeFileLimit", this.fileLimit);
    if (
      this.$store.state.create.postElements.length > this.$route.query.index
    ) {
      console.log("im editing!");
    }
    this.resetState();
  },
  destroyed() {
    this.$store.dispatch("clearFiles");
  }
});
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
