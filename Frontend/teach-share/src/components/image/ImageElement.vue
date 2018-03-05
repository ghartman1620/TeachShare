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
    computed: {},
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
            if (val.indexOf('http') === -1) {
                 return `http://localhost:8000${val}`;
            }
            return `${val}`;
        },
        toggleEditText() {
            //@deprecated: no longer in use
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
