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
    <!-- <br><br> make sure any kind of submit button doesn't run into bottom of page -->
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
    collapsed: boolean = false;



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
    background-color:  #f1f1f1; 
    opacity: .9; 
    position: fixed;
    height: auto; 
    top: 60px;
    left: 0;
    width: 410px;
    -webkit-transition: all 0.1s ease-in-out;
    -moz-transition: all 0.1s ease-in-out;
    transition: all 0.1s ease-in-out;
    overflow: auto;
    z-index: 3;
}
.sidebar.collapsed {
    width: auto;
    background-color: transparent;

}
.sidebar-btn {
    width: 100%;
}
</style>
