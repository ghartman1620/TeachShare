<template>

	<ul style="list-style-type: none;">
		<li>
			<b-container>
				<b-row>
				<b-col xl="4" sm="6" :key="file.name" v-for="file in element.content">
					<b-card>
						<div>
							<h5>
								<a :href="'http://127.0.0.1:8000' + file.url" class="card-link">{{file.name}}</a>
							</h5>
						</div>
					</b-card>
					</b-col>
				</b-row>
			</b-container>
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
