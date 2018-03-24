<template>
<body>
	<b-card>
		<file-upload :fileLimit="20" title="Upload Files">
		</file-upload>
		<submit-close-editor
			@submit="submit"
			@close="cancel"
			type="file"
			:disabled="!allFilesUploadComplete"
			disableMessage="Please Select File(s) to upload"
		/>
	</b-card>
</body>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import SubmitCloseEditor from "../SubmitCloseEditor";
export default Vue.component("edit-file", {
	components: {FileUpload, SubmitCloseEditor},
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
					element: this.generateJSON()
				}).then(function(){
                    vm.$router.push({name: "create"});
                });
			}
		},
		generateJSON() {
			var files = [];
			this.$store.state.fs.uploadedFiles.forEach(function(val){
				files.push({
                    post: 2,
                    type: "file",
                    id: val.db_id,
                    file: val.file,
                    name: val.file.name,
                    url: val.url,
                });
			});
			return {type: "file", content: files}
		},
		cancel() {
            this.$router.push({ name: "create" });
        }
	}
});
</script>


<style scoped>

</style>