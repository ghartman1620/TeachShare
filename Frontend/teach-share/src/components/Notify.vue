<template>
  <div>
      <div :key="n.id" v-for="n in getAllNotifications">
            <div class="row">
                <div class="col-2"></div>
                <div class="col-8">
                    <b-alert 
                        show
                        dismissible
                        @dismissed="close(n)"
                        :variant="n.type">
                            <div v-html="n.content"></div>
                    </b-alert>
                </div>
                <div class="col-2"></div>
            </div>
      </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
    name: "notify",
    props: [],
    computed: {
        ...mapGetters(["getAllNotifications"])
    },
    data: function() {
        return {}
    },
    methods: {
        close(note) {
            console.log(note);
            // this.$store.dispatch("removeNotification", note);
        }
        
    }
  
}
</script>

<style lang="scss" scoped>

</style>
