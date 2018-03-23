<template>
    <div>
        <div class="card-body">
            <b-carousel 
                controls 
                indicators
                background="#000000"
                img-width="600" 
                img-height="480">
                <div :key="i.id" v-for="i in this.images">
                    <b-carousel-slide 
                        :caption="i.title" 
                        :text="i.description"
                        :img-src="URL(i.url)"
                        style="height: 480px; width: auto;"
                    />
                </div>
            
            </b-carousel>
        </div>


    </div>
</template>

<script>

const carouselWidth = 900;
const carouselHeight = 600;
var carouselAR = carouselWidth/carouselHeight;


import Vue from "vue";

export default Vue.component("image-element", {
    props: ["title", "body", "images"],
    data() {
        return {
            audio: null,
            editing: false,
            localTitle: this.title,
            localBody: this.body,
            sizeStyle: { width: "100%", height: "600px", padding: "20px" }
        };
    },
    computed: {},
    mounted: function() {
        this.audio = document.getElementById(this.id);
    },
    methods: {
        getSizeStyle() {
            if (this.isMounted) {
            }
            return {
                width: "100%",
                height: "600px",
                padding: "20px"
            };
        },
        URL(val) {
            if (val.indexOf("http") === -1) {
                return `http://localhost:8000${val}`;
            }
            return `${val}`;
        },
        toggleEditText() {
            //@deprecated: no longer in use
            this.editing = !this.editing;
        },
        changedTitle() {
            this.$parent.$emit("changedTitle", this.localTitle);
        },
        changedBody() {
            this.$parent.$emit("changedBody", this.localBody);
        },

        changeSizeStyle() {
            var maxImageHeight = 0;
            var self = this;
            this.images.forEach(function(img) {
                var imageObj = new Image();
                imageObj.src = self.URL(img.url);
                maxImageHeight =
                    imageObj.height > maxImageHeight
                        ? imageObj.height
                        : maxImageHeight;
            });
            this.sizeStyle = {
                width: "100%",
                height: maxImageHeight + 10 + "px",
                padding: "20px"
            };
        }
    },
    mounted() {
        window.setTimeout(this.changeSizeStyle, 500);
        console.log("in mounted function");
    }
});

</script>

<style lang="scss" scoped>
$background-color: lighten(#bececa, 10%);

    // have to set carousel height/width when changing javascript variables

    #carousel {
        top: 50%;
        width: 900px;
        height: 600px;
    }

    #carousel-card {
        background: $background-color;
    }

    #carousel-container {
        padding: 0px;
    }

    #image-carousel {
        width: 900px;
        height: 600px;
        background: $background-color;
    }


    .slide {
        margin-top: auto;
        margin-bottom: auto;
        margin-left: auto;
        margin-right: auto;
        background: $background-color;
        height: 600px;
        width: auto;
    }

</style>