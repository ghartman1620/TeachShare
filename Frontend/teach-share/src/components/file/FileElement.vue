<template>

	<ul style="list-style-type: none;">
		<li>
			<div class="row">
				<div v-for="file in element.files" class="col-xl-4 col-sm-6">
					<div class="card">
						<div class="card-body">
							<div>
								<h5 class="card-title text-center">
									<a :href="'http://127.0.0.1:8000' + file.url" class="card-link">{{file.name}}</a>
								</h5>
							</div>
						</div>
					</div>
					</div>
				</div>
		</li>
	</ul>
</template>

<style>

</style>

<script>
import Vue from "vue";

export default Vue.component("file-element", {
    props: ["element"],
    data() {
        return {};
    }
});
</script>
