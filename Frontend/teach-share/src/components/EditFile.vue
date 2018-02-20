<template>
	<body>
	<file-upload :fileLimit="20" title="Upload Files">
	</file-upload>
	<router-link :to="{name: 'create'}">
        <button @click="submit" type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
            <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
            <span v-else>Submit Image(s)</span>
        </button>
        </router-link>
       </body>
</template>

<script>
import Vue from "vue";
import FileUpload from "./FileUpload";
export default Vue.component("edit-file", {
	components: {FileUpload},
	computed: {
		allFilesUploadComplete(){
			return this.$store.getters.allFilesUploadComplete;
		}
	}
});
</script>


<style>

</style>