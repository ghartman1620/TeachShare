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

import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";
import { Component, Prop } from "vue-property-decorator";
import {GenericFile} from "../../models";
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
export default class EditFile extends Vue{
	@Getter("fs/hasFiles") hasFiles;
	@Getter("fs/allFilesUploadComplete") allFilesUploadComplete;
	@Getter("fs/files") files;
	@Action("addElement") addElement;

	submit() {
		console.log("submitting file element");
		console.log(this.generateJSON());
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
		return {type: "file", content: this.files.objectify()}
	}
	cancel(){
		this.$router.push({ name: "create" });
	}
};
</script>


<style scoped>
.card {
	padding: 10px;
}
</style>