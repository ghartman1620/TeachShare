<template>
<div>
    <div class="card-body">
        <b-carousel controls img-width="600" img-height="480">
            <div :key="i.id" v-for="i in this.images">
                <b-carousel-slide 
                    :caption="i.title" 
                    :text="i.description"
                    :img-src="URL(i.url)"
                    style="height: 600px"
                />
            </div>
        </b-carousel>
            <!-- <div v-bind:key="i.id" v-for="i in this.images" class="carousel-item">
                <img class="d-block w-100" style="width: 100%" :src="URL(i.url)">
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
            </a> -->
        </div>
        <br><br>
        <h4 v-if="!editing" @dblclick="toggleEditText" class="card-title">{{ localTitle }}</h4>
        <input @dblclick="ToggleEditText" @change.prevent="changedTitle" class="col-12" v-if="editing" v-model="localTitle" type="text">
        <p v-if="!editing" @dblclick="toggleEditText" class="card-text">
            {{localBody}}
        </p>
        <textarea @dblclick="toggleEditText" class="col-12" @change.prevent="changedBody" v-if="editing" v-model="localBody" rows="3"></textarea>
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

export default Vue.component("image-element", {
    props: ["title", "body", "images"],
    data() {
        return {
            audio: null,
            editing: false,
            localTitle: this.title,
            localBody: this.body,
            sizeStyle: {width: "100%", height: "600px", padding: "20px"}
        };
    },
    computed: {
        url: function() {
            return `http://localhost:8000${this.source}`;
        }
    },
    mounted: function() {
        console.log("in image element");
        console.log(this.images);
        this.audio = document.getElementById(this.id);
    },
    methods: {
        getSizeStyle() {
            if(this.isMounted){
                
            }return {
                width: "100%",
                height: "600px",
                padding: "20px",
            }
        },
        URL(val) {
            return `http://localhost:8000${val}`;
        },
        toggleEditText() {
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
        },
        changeSizeStyle() {
            var maxImageHeight = 0;
            console.log(maxImageHeight);
            var self = this;
            this.images.forEach(function(img){
                var imageObj = new Image();
                imageObj.src = self.URL(img.url);
                console.log(imageObj.src);
                maxImageHeight = imageObj.height > maxImageHeight 
                    ? imageObj.height : maxImageHeight;
                console.log(imageObj.height);
                console.log(maxImageHeight);    
            });
            this.sizeStyle =  {
                width: "100%",
                height: maxImageHeight+10,
                padding: "20px",
            };
        }
    },
    mounted() {
        window.setTimeout(this.changeSizeStyle, 500);
    }
});
</script>
