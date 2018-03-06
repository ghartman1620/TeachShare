<template>
    <div>
        
        <div v-if="!editing">
            <b-container>
                <b-card> {{ text }} </b-card>
                <br>
                <b-row>
                    <b-col offset="4" cols="4">
                        <b-btn
                            block
                            variant="info"
                            @click="editing = !editing">
                            Edit Comment
                        </b-btn>
                    </b-col>
                </b-row>
            </b-container>
        </div>
        <div v-if="editing">
            <b-container>
                <b-form-textarea
                    :rows="4"
                    v-model="text">
                </b-form-textarea>
                <b-row>
                    <b-col offset="2" cols="5">
                        <br>
                        <b-btn
                            @click="submit"
                            block
                            variant="primary">
                            Submit Comment
                        </b-btn>
                    </b-col>
                    <b-col cols="2">
                        <br>
                        <b-btn
                            @click="cancel"
                            block
                            variant="danger">
                            Cancel
                        </b-btn>
                    </b-col>
                </b-row>
            </b-container>
        </div>
    </div>
</template>

<script>
import TextElement from "../text/TextElement";
import EditText from "../text/EditText";

export default {
    name: "comment-entry",
    props: ["comment"],
    components: {TextElement, EditText},
    data: function() {
        return {
            editing: false,
            text: ""
        }
    },
    computed: {
    },
    methods: {
        submit() {
            console.log("Text: ", this.text);
            this.editing = false;
        },
        cancel() {
            console.log("Cancelling comment.")
            this.editing = false;
        }

    },
    mounted() {
        this.text = this.comment.content;
    }
}
</script>

<style lang="scss" scoped>

</style>
