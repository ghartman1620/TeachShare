<template>
	<ul style="list-style-type: none;">
		<li>
		<div class = "container">
			<div class = "row">			
				<div class="card" style="width: 18rem;">
				<div class="card-body">
					<div class = "col-md"
						<h5 class="card-title text-center">
							<a href="#" class="card-link">Title</a>
						</h5>
						<p class="card-text text-center">Description</p>
					</div>
					<div class = "col-sm"
						<button type="button" class="btn btn-primary btn-sm">Remove</button>
					</div>
				</div>
				</div>
			</div>
		</div>
		</li>
		<li>
		<div class = "container">
			<div class = "row">			
				<div class="card" style="width: 18rem;">
				<div class="card-body">
					<div class = "col-md"
						<h5 class="card-title text-center">
							<a href="#" class="card-link">Title</a>
						</h5>
						<p class="card-text text-center">Description</p>
					</div>
					<div class = "col-sm"
						<button type="button" class="btn btn-primary btn-sm">Remove</button>
					</div>
				</div>
				</div>
			</div>
		</div>
		</li>
		<li>
		<div class = "container">
			<div class = "row">			
				<div class="card" style="width: 18rem;">
				<div class="card-body">
					<div class = "col-md"
						<h5 class="card-title text-center">
							<a href="#" class="card-link">Title</a>
						</h5>
						<p class="card-text text-center">Description</p>
					</div>
					<div class = "col-sm"
						<button type="button" class="btn btn-primary btn-sm">Remove</button>
					</div>
				</div>
				</div>
			</div>
		</div>
		</li>
		<li>
		<div class = "container">
			<div class = "row">			
				<div class="card" style="width: 18rem;">
				<div class="card-body">
					<div class = "col-md"
						<h5 class="card-title text-center">
							<a href="#" class="card-link">Title</a>
						</h5>
						<p class="card-text text-center">Description</p>
					</div>
					<div class = "col-sm"
						<button type="button" class="btn btn-primary btn-sm">Remove</button>
					</div>
				</div>
				</div>
			</div>
		</div>
		</li>
	</ul>
</template>

<style>
	li {
    	float: left;
	}
</style>

<script>
import Vue from 'vue';

export default Vue.component('file-component', {
    props: ['title', 'filename'],
    data() {
      return {

      }
    }
})
</script>
