<template>

	<ul style="list-style-type: none;">
		<li>
			<div class="row">
				<div :key="file.pk" v-for="file in element.content" class="col-xl-4 col-sm-6">
					<div class="card">
						<div class="card-body">
							<div>
								<h5 class="card-title text-center">
									<a :href="file.url" class="card-link">{{file.name}}</a>
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

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
	name: "file-element",
	props: ["element"]
})
export default class FileElement extends Vue{
	@Prop({})
	element: any;
};
</script>
