<template>
<body>


    <!--We can use any buttons we want in the toolbar!
    Check out the github for more examples, and the
    exact code needed for other types of buttons -->
    <div class="row">
        <!-- These were in the editor but can't be commented out as part
        of a tag so here they are. -->
        <!-- @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)" 
        @ready="onEditorReady($event)" -->
        <div class="custom-quill-editor">
            <quill-editor v-model="element.content" :options="editorOption">
                <div id="toolbar" slot="toolbar">
                    <!-- Add a bold button -->
                    <button class="ql-bold">Bold</button>
                    <button class="ql-italic">Italic</button>
                    <button class="ql-list">List</button>
                    <!-- Add font size dropdown -->
                    <select class="ql-size">
                        <!-- Note a missing, thus falsy value, is used to reset to default -->
                        <option selected></option>
                        <option value="large"></option>
                        <option value="huge"></option>
                    </select>
                    <select class="ql-font">
                        <option selected="selected"></option>
                        <option value="serif"></option>
                        <option value="monospace"></option>
                    </select>
                    <!-- You can also add your own
                    <button id="custom-button" @click="customButtonClick">[ Click me ]</button-->
                </div>
            </quill-editor>


            <div class="quill-code">
            </div>
            
        </div>
        
    </div>
    <div class="row">
        <router-link :to="{ name: 'create'}"><button v-on:click="submit">Submit</button></router-link>
        <router-link :to="{name: 'create'}"><button>close</button></router-link>
    </div>
</body>
</template>

<script>
import Vue from "vue";
import VueQuillEditor from "vue-quill-editor"

import "quill/dist/quill.core.css"
import "quill/dist/quill.snow.css"
import "quill/dist/quill.bubble.css"
import { mapState } from "vuex";
Vue.use(VueQuillEditor,)

export default Vue.component("edit-text", {
    data() {
        return {
            element: {},
            editorOption: {
                modules: {
                    toolbar: "#toolbar"
                }
            } //sooooooooo many options to pass for customizing the editor.
        }
    },
    computed: {


    },

    methods: {
        submit: function(event){
            if(this.$route.query.index == this.$store.state.create.postElements.length){
                this.$store.dispatch("addElement", this.element);
            }
            else{
                this.$store.dispatch("editElement", {
                    index : this.$route.query.index,
                    element : this.element
                });
            }

        },
        close: function(event){
            console.log("close");
        },

    },
    mounted(){
        this.$router.replace({name: "edit-text", query: {index: this.$route.query.index}})
        console.log("mounted edit text");
        if(this.$route.query.index >= this.$store.state.create.postElements.length){
            this.element = {
                type: "text",
                content: "",
            }
        }else{
            this.element = Object.assign({}, this.$store.state.create.postElements[this.$route.query.index]);
        }
    },
    beforeDestroy(){
        console.log("destroy");
    },
    created() {
		this.$store.dispatch("openEditor");
	},
	destroyed() {
		this.$store.dispatch("closeEditor");
	}
})
</script>

<style lang="scss" scoped>

.editor-card {
    max-width: 1000px;
}

.custom-quill-editor {
    background: #F9F9F9;
    height: 100%;
}
.quill-editor {
    height: 100%;
}

.quill-code {
    max-width: 1000px;
    height: auto;
}


.quill-code {
    border: 1px;
    height: auto;
}

.quill-container{
    width: 1000px;
    /*background: #c0c0c0;*/
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    border: 1;
}
</style>
