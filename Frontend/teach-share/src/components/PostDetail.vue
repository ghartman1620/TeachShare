<template>
    <div>
        <post
            v-if="postLocal !== undefined"
            :post="postLocal"
            :index="postid"
        >
        </post>
        <br><br>
    </div>
</template>

<script>
import Post from "./Post";

export default {
    name: "PostDetail",
    components: {Post},
    data: function() { 
        return { }
    },
    computed: {
        postLocal() {
            return this.$store.getters.getPostById(this.$route.params.post_id);
        },
        postid() {
            return this.postLocal !== undefined ? this.postLocal.pk : this.$route.params.post_id
        }
    },
    methods: {
        getComments() {
            var vm = this;
            this.$store
                .dispatch("fetchCommentsForPost", this.postLocal.pk)
                .then(function(res) {
                    vm.$log(res);
                    for (let c of vm.post.comments) {
                        vm.$log(c);
                        let hasUser = vm.$store.state.users.find((val) => val.pk === c.pk);
                        vm.$logWarning("Post.vue", hasUser);
                        if (hasUser === null) {
                            
                        }
                        vm.$store.dispatch("fetchUser", c.user);
                    }
                });
        },

    },
    created() {
        this.$store.dispatch("fetchPost", this.$route.params.post_id).then((res) => {
            this.getComments();
        });
    }
}
</script>

<style lang="scss" scoped>

</style>
