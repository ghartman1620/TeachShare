<template>
<div>
  <div class="card">
    <div class="card-body">

      <div id="carouselExampleIndicators" data-interval="0" class="carousel slide" data-ride="carousel">
        <div class="carousel-inner">

          <div class="carousel-item active">
            <img class="d-block w-100 img-fluid" src="//wallpapers.wallhaven.cc/wallpapers/full/wallhaven-620548.jpg" alt="First slide">
            <div class="carousel-caption d-none d-md-block">
              <h3>Test title!</h3>
              <p>some fake text here!</p>
            </div>
          </div>

          <div v-bind:key="i.id" v-for="i in this.$store.state.image.images" class="carousel-item">
            <img class="d-block w-100" :src="URL(i.url)">
            <div class="carousel-caption d-none d-md-block">
              <h3>{{i.title}}</h3>
              <p>{{i.description}}</p>
            </div>
          </div>

          <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
          </a>
        </div>


          <br><br>
          <h4 v-if="!editing" @dblclick="ToggleEditText" class="card-title">{{ localTitle }}</h4>
          <input @dblclick="ToggleEditText" @change.prevent="changedTitle" class="col-12" v-if="editing" v-model="localTitle" type="text">
          <p v-if="!editing" @dblclick="ToggleEditText" class="card-text">
            {{localBody}}
          </p>
          <textarea @dblclick="ToggleEditText" class="col-12" @change.prevent="changedBody" v-if="editing" v-model="localBody" rows="3"></textarea>
          <div class="row">
            <div class="col-auto mr-auto"/>
            <div class="col-auto">
              <button type="button" class="btn btn-warning">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.component("image-component", {
  props: ["title", "body", "images"],
  data() {
    return {
      audio: null,
      editing: false,
      localTitle: this.title,
      localBody: this.body
    };
  },
  computed: {
    url: function() {
      return `http://localhost:8000${this.source}`;
    }
  },
  mounted: function() {
    this.audio = document.getElementById(this.id);
  },
  methods: {
    // basic play functionality (not needed)
    Play() {
      console.log("play");
      this.audio.play();
    },
    Pause() {
      console.log("pause");
      this.audio.pause();
    },
    URL(val) {
      return `http://localhost:8000${val}`;
    },
    ToggleEditText() {
      console.log("editing text!");
      this.editing = !this.editing;
    },
    changedTitle() {
      console.log("emit!");
      this.$parent.$emit("changedTitle", this.localTitle);
    },
    changedBody() {
      console.log("emit!");
      this.$parent.$emit("changedBody", this.localBody);
    }
  }
});
</script>
