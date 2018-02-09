<template>
    <div class="container">
      <!--UPLOAD-->
      <div class="row">
        <div class="col-12">
        <form enctype="multipart/form-data" novalidate multiple v-if="isInitial || isSaving">
          <h1>Upload images</h1>
          <div class="dropbox">
            <input
              type="file"
              multiple
              :name="uploadFieldName"
              :disabled="isSaving"
              @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
              accept="acceptedFileTypes"
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
        <h4>Uploaded files: </h4>
        <ul class="list-group">
          <li v-bind:key="obj.file.name" v-for="obj in filesUploadStatus"
            class="list-group-item d-flex justify-content-between align-items-center">
              {{ obj.file.name }}
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
              <div class="col-1" v-if="obj.percent===100">
                Done.
              </div>
          </li>
        </ul>
        </div>
      </div>
    </div>
</template>

<!-- Javascript -->
<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';

var fileTypes = Object.freeze({
  'FILE': 'file/*',
  'IMG': 'image/*',
  'VID': 'video/*', // don't know if this is correct
  'AUD': 'audio/*'
})

const UPLOAD_INITIAL = 0, UPLOAD_SAVING = 1, UPLOAD_SUCCESS = 2, UPLOAD_ERROR = 3;

export default Vue.component('file-upload', {
    components: {},
    //file/*
    props: ['uploadFieldName', 'acceptedFileTypes'],
    data() {
      return {
        currentStatus: null,
        currentFileList: [],
      }
    },
    computed: {
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
      currentFiles() {
        return this.$store.state.files;
      },
      ...mapGetters([
        'filesUploadStatus',
        'allFilesUploadComplete'
      ]),
    },
    methods: {
      updatePercent(percent, file) {
        console.log("UpdatePercent: ", percent, file)
        console.log(this.fileKeys);
        this.files = this.$set(this.fileKeys, String(file.name), percent);
      },
      save(formData) {
        var self = this
        this.$store.dispatch('fileUpload', {self, formData})

      },
      resetState() {
        this.currentStatus = UPLOAD_INITIAL;
        this.uploadedFiles = [];
        this.uploadError = null;
      },
      filesChange(fieldName, fileList) {
        console.log(fieldName, fileList);
        console.log(fileList[0].type)
        this.currentFileList.push(fileList)

        const formData = new FormData();

        if (!fileList.length) { return; }

        Array.from(Array(fileList.length).keys())
          .map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
          });
        this.save(formData);
      },
    },
    mounted() {
      this.resetState();
    }
  })

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


</style>
