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

<script lang="ts">
import Vue from "vue";

import FileUpload from "../FileUpload.vue";
import { mapGetters } from "vuex";
import { Component, Prop } from "vue-property-decorator";
import { GenericFile, ModelMap } from "../../models";
import { hasFiles, filesUploadStatus, files, allFilesUploadComplete } from "../../store_modules/FileService"
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    components: {FileUpload},
    name: "edit-file",
})
export default class EditFile extends Vue {

    get hasFiles() {
        return hasFiles(this.$store);
    }
    get files(){
        return filesUploadStatus(this.$store);
	}
	get fileMap(): ModelMap<GenericFile>{
		return files(this.$store);
	}
    get allFilesUploadComplete(): boolean {
        return allFilesUploadComplete(this.$store);
    }

    submit(): void {
        this.$parent.$emit("submitElement", this.generateJSON(), this.$route.query.index);
        /*
		var vm = this;
		if (this.$route.query.index === this.$store.state.create.postElements.length) {
			this.addElement(this.generateJSON())
				.then(function(){
					vm.$router.push({name: "create"});
				});
		} else {
			this.$store.dispatch("editElement", {
				index: this.$route.query.index,
				element: this.generateJSON()
			}).then(function(){
				vm.$router.push({name: "create"});
			}
		}
		*/
    }
    generateJSON(): any {
        return {type: "file", content: this.fileMap.list()}
    }
    cancel(): void{
        this.$router.push({ name: "create" });
    }
}
</script>


<style scoped>
.card {
	padding: 10px;
}
</style>