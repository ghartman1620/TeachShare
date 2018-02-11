<template>
<div class="row">
  <div class="col-1"></div>
  <div class="col">
    <div class="card">

    <nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <a class="nav-item nav-link active"
        id="nav-home-tab"
        data-toggle="tab"
        href="#nav-home"
        role="tab"
        aria-controls="nav-home"
        aria-selected="true">
          Video Link (YouTube, Vimeo, etc...)
      </a>
      <a class="nav-item nav-link"
        id="nav-profile-tab"
        data-toggle="tab"
        href="#nav-profile"
        role="tab"
        aria-controls="nav-profile"
        aria-selected="false">
          Video File
      </a>
    </div>
  </nav>
  <div class="card-body">
  <div class="tab-content" id="nav-tabContent">
    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
      <h1>Video Links</h1>
      <p>
        Enter the embed url here
      </p>
      <form action="">
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon3">Embed URL</span>
          </div>
          <input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3">
        </div>

        <br>
        <p>
          Video Description (optional) :
        </p>
        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        <br>
        <div class="row">
          <div class="offset-4 col-4">
            <button type="button" class="btn btn-primary btn-block">Submit</button>
          </div>
        </div>
      </form>
    </div>
    <div class="tab-pane fade"
      id="nav-profile"
      role="tabpanel"
      aria-labelledby="nav-profile-tab">
      <file-upload title="Upload Video Files"></file-upload>
    </div>
    </div>
    </div>
    </div>
  </div>
  <div class="col-1"></div>
</div>
</template>

<script>
import Vue from 'vue';
import FileUpload from '../FileUpload';

export default Vue.component('edit-video', {
    components: { FileUpload },
    props: [],
    data() {
      return {
        'id': null,
        'isEmbed': null,
        'isFile': false,
        'autoplay': false,
        'width': null,
        'height': null,
        'controls': false,
        'title': '',
        'source': '',
        'link': '',
        'playlist': '',
        'loop': false
      }
    },
    computed: {

    }
  })
</script>


<style lang="scss" scoped>

</style>

