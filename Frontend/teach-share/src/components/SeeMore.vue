<template>
<div ref="content" :class="contentClasses">
    <div :style="hideOrFullStyle">
        <div>
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
    <div>
        <button style="z-index: 100;" v-if="needShowMore" @click="showOrHideContent" class="btn btn-dark btn-block">{{ expandedOrNotText }}</button>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
    name: "see-more",
    props: [
        "maxHeight"
    ]
})
export default class SeeMore extends Vue {
    @Prop() maxHeight;

    expanded: boolean = false
    elementHeight = 0;
    contentClasses: any[] = [];
    needShowMore: boolean = true;

    get expandedOrNotText() {
        return this.expanded ? "See Less" : "See More";
    }
    get hideOrFullStyle() {
        return this.expanded
            ? {
                    "max-height": "none",
                    overflow: "hidden"
                }
            : {
                    "max-height": this.maxHeight + "px",
                    overflow: "hidden"
                };
    }

    showOrHideContent() {
        if (!this.expanded) {
            this.contentClasses.pop();
            this.expand();
        } else {
            this.contentClasses.push("gradient");
        }
        this.expanded = !this.expanded;
    }

    expand() {
        this.$emit("expanded", this.expanded);
    }

    mounted() {
        var vm = this;
        
        console.log(this);
        Vue.nextTick().then(function() {
            var ele = vm.$refs.content as HTMLElement;
            vm.elementHeight = ele.offsetHeight;
            if (vm.elementHeight > vm.maxHeight) {
                vm.contentClasses.push("gradient");
                vm.needShowMore = true;
                vm.expanded = false;
            } else {
                vm.needShowMore = false;
            }
        });
    }
}
</script>
<style>
.gradient {
    position: relative;
    /* that disables clicking through carousels/DL files on hidden things */
}
.gradient:after {
    overflow: "hidden";
    content: "";
    position: absolute;
    z-index: 1;
    bottom: 38px;
    pointer-events: none;
    background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 1) 80%
    );
    width: 100%;
    height: 6em;
}
</style>




