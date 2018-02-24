<template>
<body>
	<ul style="list-style-type: none;">
		<li>
		<div class = "container">
			<div class = "row">
				<div v-for="file in element.files">
				<div class="card" style="width: 18rem;">
				<div class="card-body">
					<div class = "col-md"
						<h5 class="card-title text-center">
							<a :href="'http://127.0.0.1:8000' + file.url" class="card-link">{{file.name}}</a>
						</h5>
					</div>

				</div>
				</div>
				</div>
			</div>
		</div>
		</li>
	</ul>
</body>
</template>

<style>
	li {
    	float: left;
	}
</style>

<script>
import Vue from "vue";

export default Vue.component("file-element", {
    props: ["element"],
    data() {
      return {

      }
    }
})
</script>
