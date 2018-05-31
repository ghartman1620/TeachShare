<template>
<div>
    <button @click="getPost">getPost
    </button>
    <input v-model.number="num" type="number"/>
    <button @click="putPost">putPost</button>
    <button @click="deletePost">deletePost</button>
    <div v-for="p in posts">
        <p>
            {{p.pk}}{{p.title}}{{p.content}}
        </p>
    </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import {Component} from "vue-property-decorator";
import {Post} from "../models";
import Database from "../Database";
@Component({
    "name": "db-test"
})
export default class DbTest extends Vue{
    posts: Post[] = [];
    d: Database = Database.getInstance();
    num: number = -1;
    mounted() {
        


   

        

        

    }
    putPost() {
        var p: Post = new Post();
        p.likes = 10;
        p.pk = 1;
        p.title = "hello world";
        p.content = [{
            "type" : "text",
            "content" : "<b>I have content</b>"
        }];
        this.d.putPost(p, 1);
    }
    getPost() {
        var vm: DbTest = this;
        this.d.getPost(this.num).then(function(p){
            vm.posts.push(p);
        }).catch(err => console.error("no post"));
    }
    deletePost() {
        this.d.deletePost(this.num).then(function(p){
        })
    }
};

</script>
