<template>
    <div>
        <b-form>
            <file-upload :fileLimit="1" title="Upload Video Files" fileAcceptType="VID"></file-upload>
            <br>
            <b-row>
                <b-col>
                    <b-input-group prepend="Title">
                        <b-input
                            v-model="ActualTitle"
                            type="text"
                            name="height"
                            aria-describedby="basic-height"/>
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row>

                <b-col>
                <!-- dimension picker -->
                <dimension-picker></dimension-picker>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <h4>
                        Video Description(s) (optional) :
                    </h4>
                    <b-form-textarea v-model="fileDescription"id="exampleFormControlTextarea1" :rows="3"></b-form-textarea>
                    <br>
                </b-col>
            </b-row>
            <submit-close-editor
                @submit="submit"
                @close="cancelEdit"
                type="Video"
                :disabled="!allFilesUploadComplete"
                disableMessage="Please upload a video or wait for video upload to finish."/>
        </b-form>
    </div>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import DimensionPicker from "../DimensionPicker";
import { mapGetters } from "vuex";
import SubmitCloseEditor from "../SubmitCloseEditor";

var _ = require("lodash");

export default Vue.component("edit-video-file", {
    components: { FileUpload, DimensionPicker, SubmitCloseEditor },
    props: [],
    data() {
        return {
            width: 640,
            height: 480,
            title: "",
            source: "",
            fileDescription: ""
        };
    },
    computed: {
        ActualTitle: {
            get: function() {
                return this.title;
            },
            set: function(val) {
                this.title = val;
            }
        },
        ...mapGetters(["hasFiles", "allFilesUploadComplete"])
    },
    methods: {
        DebounceFileSubmit: _.throttle(function() {
            this.generateFileJSON();
        }, 1000),
        submit() {
            if (
                this.$route.query.index ==
                this.$store.state.create.postElements.length
            ) {
                this.$store.dispatch("addElement", this.generateFileJSON());
            } else {
                this.$store.dispatch("editElement", {
                    index: this.$route.query.index,
                    element: this.generateFileJSON()
                });
            }
            this.$router.push({ name: "create" });
        },
        generateFileJSON() {
            let val = this.$store.state.fs.uploadedFiles[0];
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
            this.$store.dispatch("submitVideoFile", obj);
            return { type: "video_file", content: obj };
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
    destroyed() {
        this.$store.dispatch("removeAllVideos");
    }
});
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

