<template>
<div :class="sidebarClasses">
    
    <b-button @click="toggleSidebarCollapse()" class="btn-secondary sidebar-btn">
        <div v-if="collapsed">
            {{collapsedString}} <font-awesome-icon icon="arrow-right"/>
        </div>
        <div v-else>
            <font-awesome-icon icon="arrow-left"/>
        </div>
    </b-button>
    <slot v-if="!collapsed">
    
    </slot>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import {Component} from "vue-property-decorator"

@Component({
    name: "side-bar",
    props: ["collapsedString"],
    components: { FontAwesomeIcon}
})
export default class SideBar extends Vue {
    sidebarClasses: string[] = ["sidebar"];
    collapsed: boolean = true;



    toggleSidebarCollapse() {
        if(this.collapsed){
            this.sidebarClasses.pop();
            this.collapsed = false;
        }
        else{
            this.sidebarClasses.push("collapsed");
            this.collapsed = true;
        }
    }

};
</script>

<style lang="scss" scoped>
.sidebar {
    background-color:  #f1f1f1; //this is some random offwhite color that i picked
    // border: 3px solid black; //this is awful lets not use it to indicate end of sidebar 
    opacity: .9; //this is also an option
    overflow: scroll;
    position: fixed;
    height: auto; //enable me for having the white background conform to the height of the contents of the sidebar
    top: 60px; /* height of top navbar */
    left: 0;
    width: 410px;
    -webkit-transition: all 0.1s ease-in-out;
    -moz-transition: all 0.1s ease-in-out;
    transition: all 0.1s ease-in-out;
    overflow-y: scroll;
    z-index: 3;
}
.sidebar.collapsed {
    width: auto;
    background-color: transparent;
    overflow: hidden;
}
.sidebar-btn {
    width: 100%;
}
</style>
