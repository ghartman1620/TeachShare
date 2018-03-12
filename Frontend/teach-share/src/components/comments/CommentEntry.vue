<template>
    <div>
        
        <div v-if="!editing">

                <b-card>
                    <p class="card-text">{{ text }}</p>
                    <br>
                    <em slot="footer">
                            Originally posted: {{comment.timestamp | moment("from")}}
                    </em>
                    
                    <b-row>
                        <b-col cols="7" sm="6" md="5">
                            User: <b-badge variant="primary">{{user}}</b-badge>
                        </b-col>
                        <b-col offset="3" cols="2" offset-sm="4" sm="2" offset-md="6" md="1">
                            <!-- <b-btn
                                size="sm"
                                variant="warning"
                                @click="editing = !editing">
                                <font-awesome-icon icon="edit" fixed-width></font-awesome-icon>
                            </b-btn> -->
                        </b-col>
                    </b-row>
                </b-card>


        </div>
        <div v-if="editing">
            <b-container>
                <b-form-textarea
                    :rows="4"
                    v-model="text">
                </b-form-textarea>
                <b-row>
                    <b-col offset="1" cols="5" offset-md="2" md="4" offset-lg="3" lg="3">
                        <br>
                        <b-btn
                            @click="submit"
                            block
                            variant="primary">
                            <font-awesome-icon icon="check" fixed-width></font-awesome-icon>
                            Submit
                        </b-btn>
                    </b-col>
                    <b-col cols="5" md="4" lg="3">
                        <br>
                        <b-btn
                            @click="cancel"
                            block
                            variant="danger">
                            <font-awesome-icon icon="times" fixed-width></font-awesome-icon> Cancel
                        </b-btn>
                    </b-col>
                </b-row>
            </b-container>
        </div>
        <br><br>
    </div>
</template>

<script>
import TextElement from "../text/TextElement";
import EditText from "../text/EditText";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";

export default {
    name: "comment-entry",
    props: ["comment", "post", "user", "edit"],
    components: { TextElement, EditText, FontAwesomeIcon },
    data: function() {
        return {
            editing: false,
            text: "",
            newComment: true,
            prevText: ""
        };
    },
    computed: {
        fullUser() {
            if (this.comment.user !== undefined) {
                return this.$store.getters.getUserByID(this.comment.user);
            } 
            return undefined;
        }
    },
    methods: {
        submit() {
            this.editing = false;
            this.prevText = this.text;
            this.$emit("changedComment", this.text);
            this.$store.dispatch("createOrUpdateComment", {
                pk: this.comment.pk,
                post: this.post.pk,
                text: this.text,
                user: this.user.pk
            });
        },
        cancel() {
            this.editing = false;
            this.text = this.prevText;
        }
    },
    mounted() {
        
        this.text = this.comment.text;
        this.prevText = this.text;
        this.editing = this.edit;
        
    }
};
</script>

<style lang="scss" scoped>

</style>
