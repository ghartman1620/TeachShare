<template>
  <div class="notify-above fixed-top">
      <div :key="n.id" v-for="n in getAllNotifications">
            <div class="row">
                <div class="col-2"></div>
                <div class="col-8">
                    <b-alert 
                        show
                        dismissible
                        @dismissed="close(n)"
                        :variant="convertNotifyType(n.type)">
                            <div v-html="n.content"></div>
                    </b-alert>
                </div>
                <div class="col-2"></div>
            </div>
      </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { NotifyType } from "../models";
import { getAllNotifications, removeNotification } from "../store_modules/NotificationService";
import { State } from "vuex-class";

@Component({
    props: {},
    name: "notify"
})
export default class Notify extends Vue {
    @State("notify") notificationState;

    // computed
    get getAllNotifications() {
        return this.notificationState.pending;
    }

    close(note: any) {
        removeNotification(this.$store, note.id);
    }
    convertNotifyType(val: number): string {
        return NotifyType[val];
    }
}
</script>

<style lang="scss" scoped>

.notify-above {
    padding-top: 65px;
}

</style>
