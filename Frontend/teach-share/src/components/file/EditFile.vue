<template>
<body>
	<div class="container card">
		<file-upload :fileLimit="20" title="Upload Files">
		</file-upload>
		<router-link :to="{name: 'create'}">
			<button @click="submit" type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
				<span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
				<span v-else>Submit File(s)</span>
			</button>
		</router-link>
	</div>
</body>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
export default Vue.component("edit-file", {
	components: {FileUpload},
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
				element: this.generateJSON()
				});
			}
		},
		generateJSON() {
			var files = []
			console.log(this.$store.state.fs.uploadedFiles);
			for (var i = 0; i < this.$store.state.fs.uploadedFiles.length; i++){
				files.push({
					url: this.$store.state.fs.uploadedFiles[i].url,
					name: this.$store.state.fs.uploadedFiles[i].file.name,
				})
			}
			console.log(files);
			return {type: "file", files: files}
		}
	},
	created() {
		this.$store.dispatch("openEditor");
	},
	destroyed() {
		this.$store.dispatch("closeEditor");
	}
});
</script>


<style>

</style>