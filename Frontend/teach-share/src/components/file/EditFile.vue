<template>
<body>
	<div class="card">
		<file-upload :fileLimit="20" title="Upload Files">
		</file-upload>
		<div class="row">
			<div class="offset-3 col-6">
				<button @click.prevent="submit" type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
					<span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
					<span v-else>Submit File(s)</span>
				</button>
			</div>
			<div class="col-2">
				<button @click.prevent="cancel" type="button" class="btn btn-danger btn-block">
						Cancel
				</button>
			</div>
		</div>
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
			console.log(this.$store.state.fs.uploadedFiles);
			this.$store.state.fs.uploadedFiles.forEach(function(val){
				console.log(val.file);
				files.push({
                    post: 2,
                    type: "file",
                    id: val.db_id,
                    file: val.file,
                    name: val.file.name,
                    url: val.url,
                });
			});
			console.log(files);
			return {type: "file", content: files}
		},
		cancel() {
            this.$router.push({ name: "create" });
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


<style scoped>
.card {
	padding: 10px;
}
</style>