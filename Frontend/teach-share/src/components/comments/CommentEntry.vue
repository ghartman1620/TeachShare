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
                            User: <b-badge variant="primary">{{fullUsername}}</b-badge>
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

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import TextElement from "../text/TextElement.vue";
import EditText from "../text/EditText.vue";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import { createUpdateComment } from "../../store_modules/comments/CommentService";
import { Comment, User, Post } from "../../models";

@Component({
    name: "comment-entry",
    components: { TextElement, EditText, FontAwesomeIcon },
    props: [
        "comment",
        "post",
        "user"
    ]
})
export default class CommentEntry extends Vue {
    comment: any;
    post: any;
    user: any;
    edit: any;
    editing = false;
    text: string = "";
    newComment = true;
    prevText = "";

    get fullUser() {
        return this.$store.getters.getUserByID(this.user);
    }

    get fullUsername() {
        if (this.fullUser !== undefined) {
            return this.fullUser.username;
        }
        return "";
    }

    submit() {
        this.editing = false;
        this.prevText = this.text;
        this.$emit("changedComment", this.text);
        let obj = {
            pk: this.comment.pk,
            post: this.post.pk,
            content: this.text,
            user: this.user.pk
        };
        // createUpdateComment(this.$store, new Comment(1, 1, 1, "hey there!"));
    }
    cancel() {
        this.editing = false;
        this.text = this.prevText;
    }
    mounted() {
        this.text = this.comment.text;
        this.prevText = this.text;
        this.editing = this.edit;
    }
}
</script>

<style lang="scss" scoped>

</style>
