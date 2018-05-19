<template>
    <div>
        <PostComponent
            v-if="typeof postLocal !== 'undefined'"
            :post="postLocal"
            :index="postid">
        </PostComponent>
        <b-button variant="primary" @click="forkpost" class="forkpostbutton">Collaborate</b-button>
    </div>
</template>

<script lang="ts">

import PostComp from "./Post.vue";
import { Vue, Component, Prop } from "vue-property-decorator";
import { Post, Comment, User } from "../models";
import { getByPost, getCommentsForPost } from "../store_modules/CommentService";
import { getPostById, fetchPost } from "../store_modules/PostService";
import { fetchUser, getLoggedInUser } from "../store_modules/UserService";
import {
  State,
  Getter,
  namespace
} from 'vuex-class'
import api from "../api";

const ModuleGetter = namespace('', Getter)

@Component({
    props: {},
    components: { "PostComponent": PostComp }
})
export default class PostDetail extends Vue {
    @State(state => state.user) userModule;

    get postLocal(): Post {
        return getPostById(this.$store)(this.$route.params.post_id);
    }
    get postid() {
        return this.postLocal !== undefined ? Number(this.postLocal.pk) : Number(this.$route.params.post_id)
    }

    forkpost(){
        var obj :any= {
            ...this.postLocal,
            original_user: this.postLocal.user
        }
        obj.user = getLoggedInUser(this.$store).pk;
        obj.comments = [];
        console.log(obj);
        api.post("/posts/", obj).then(Response=>{
            window.localStorage.setItem("inProgressPost", Response.data.pk);
            this.$router.push({name: "create"});
            console.log(Response);
        })
    }

    getComments() {
        var vm = this;
        // createUpdateComment(this.$store, )
        getByPost(this.$store, Number(this.$route.params.post_id)).then(function(res) {
            console.log(res);
            let comments = getCommentsForPost(vm.$store)(Number(vm.$route.params.post_id));
            console.log(comments);
            for (let c of comments) {
                console.log(c);
                let alreadyFetchedUsers = vm.userModule.otherUsers as User[]
                if (typeof c !== 'undefined' && typeof c.user !== 'undefined') {
                    if (typeof alreadyFetchedUsers.find( (val) => (val as User).pk as number === (c as Comment).user as number) === 'undefined') {
                        fetchUser(vm.$store, c.user as number);
                    }
                }
            }
        });
    }
    created() {
        fetchPost(this.$store, this.$route.params.post_id).then((res) => {
            this.getComments();
        }); 
    }
}
</script>

<style lang="scss" scoped>

.forkpostbutton{
    position: fixed;
    bottom: 0;
    right: 0;
}

</style>
