<template>
    <div>
        <form @submit.prevent="sendMessage">
            <button type="submit">Submit</button>
            <input type="text" v-model="message"/>
        </form>
        <div v-for="message in chat">
            <p>{{message}}</p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Component} from "vue-property-decorator";

@Component({
    name: "web-socket"
})
export default class WebSocketComp extends Vue{
    // ws: WebSocket = new WebSocket('ws://127.0.0.1:3012');
    // message: String = "";
    // chat: String[] = [];
    // mounted() {
    //     var vm: WebSocketComp = this;
    //     this.ws.onmessage = function(msg){
    //         vm.chat.push(msg.data);
    //     }
    //     //ws.send("hello world");

    // }
    // sendMessage(){
    //     this.ws.send(this.message);
    //     this.message = "";
    // }
}


</script>