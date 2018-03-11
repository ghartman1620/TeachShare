<template>
<body>
    <div class="card" style="padding: 10px;">
        <div class="row">
            <div class="col-12">
                <!--We can use any buttons we want in the toolbar!
                Check out the github for more examples, and the
                exact code needed for other types of buttons -->
                <div class="custom-quill-editor">
                    <quill-editor
                        v-model="element.content"
                        :options="editorOption">
                        <div id="toolbar" slot="toolbar">
                            <!-- Add a bold button -->
                            <button class="ql-bold"></button>
                            <button class="ql-italic"></button>
                            <button class="ql-underline"></button>
                            <button class="ql-strike"></button>
                            <button class="ql-script" value="sub"></button>
                            <button class="ql-script" value="super"></button>
                            <button class="ql-list" value="bullet"></button>
                            <button class="ql-list" value="ordered"></button>
                            <button class="ql-code-block"></button>
                            <select class="ql-align">
                                <option selected></option>
                                <option value="center"></option>
                                
                                <option value="right"></option>
                                <option value="justify"></option>
                                
                            </select>
                            <button class="ql-link">Link</button>
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
        </div>
        <div class="row">
            <div class="offset-3 col-6">
                <button @click="submit" class="btn btn-primary btn-block">
                    Submit Text
                </button>
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-danger btn-block" @click.prevent="close">
                Cancel
                </button>
            </div>
        </div>
    </div>
</body>
</template>

<script>
import Vue from "vue";
import VueQuillEditor from "vue-quill-editor";

import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { mapState } from "vuex";
Vue.use(VueQuillEditor);

export default Vue.component("edit-text", {
    data() {
        return {
            element: {},
            editorOption: {
                modules: {
                    toolbar: "#toolbar"
                }
            } //sooooooooo many options to pass for customizing the editor.
        };
    },
    computed: {},

    methods: {
        submit: function(event) {
            if (
                this.$route.query.index ==
                this.$store.state.create.postElements.length
            ) {
                this.$store.dispatch("addElement", this.element);
            } else {
                this.$store.dispatch("editElement", {
                    index: this.$route.query.index,
                    element: this.element
                });
            }
            this.$router.push({ name: "create" });
        },
        close: function(event) {
            this.$router.push({ name: "create" });
        }
    },
    mounted() {
        this.$store.dispatch("openEditor");
        if (
            this.$route.query.index >=
            this.$store.state.create.postElements.length
        ) {
            this.element = {
                type: "text",
                content: ""
            };
        } else {
            this.element = Object.assign(
                {},
                this.$store.state.create.postElements[this.$route.query.index]
            );
        }
    },
    beforeDestroy() {
        this.$store.dispatch("closeEditor");
    }
});
</script>

<style lang="scss" scoped>
.quill-editor,
.quill-code {
    height: 75%;
    width: 100%;
}

.custom-quill-editor {
    background: #ffffff;
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 13em;
}

.quill-code {
    border: none;
    height: auto;
}
</style>
