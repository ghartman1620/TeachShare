import Vue from "vue";
import User from "./user";
import api from "./api";
import {Post} from "./models";
import store from "./store";

export enum PostStatus {Loading, Saving, Saved}

export class InProgressPost{
    elements: any[];
    title: string;
    tags: string[];
    userPk: number;
    status: PostStatus;
    draft: boolean;
    pk: number = -1; //-1 if post is not yet saved as draft

    /*

    */ 
    constructor(user: User){
        var inProgressPost: string | null = window.localStorage.getItem("inProgressPost");
        if(inProgressPost === null){
            //Create new draft
            this.elements = [];
            this.title = "";
            this.tags = [];
            this.userPk = user.pk;
            this.status = PostStatus.Saving;
            this.draft = true;
            this.createNewDraft();
            
        }
        else{
            var postid: number = parseInt(inProgressPost);
            if(postid == NaN){ //this shouldn't happen, but if it does I suppose we can be prepared
                this.elements = [];
                this.title = "";
                this.tags = [];
                this.userPk = user.pk;
                this.status = PostStatus.Saving;
                this.draft = true;
                this.createNewDraft();
            }
            else{
                console.log("WE'RE GETTING A PREVIOUSLY EDITED POST!");
                // we're going to get that post and populate our InProgressPost with it
                //@TODO: use the Post model and store.ts. At the time of writing store.ts is being worked on
                //and I don't want to use it as a dependency while its being changed.
                this.elements = [];
                this.title = "";
                this.tags = [];
                this.userPk = user.pk;
                var post: InProgressPost = this;
                this.status = PostStatus.Loading;
                this.draft = false;
                post.pk = postid;
                api.get("/posts/"+ postid).then(function(response){
                    console.log(response);
                    
                    post.elements = response.data.content;
                    post.title = response.data.title;
                    post.draft = response.data.draft;
                    post.tags = response.data.tags;
                    post.status = PostStatus.Saved;
                })
                console.log("returning from post constructor");
            }
        }



        
    }
    setTags(tags: string[]): void {
        this.tags = tags;
    }
    setTitle(title: string): void {
        this.title = title;
    }


    addElement(element: any): void{
        this.elements.push(element);
    }
    removeElement(index: number): void {
        this.elements.splice(index, 1);
    }
    insertElement(index: number, element): void {
        this.elements.splice(index, 0, element);
    }
    editElement(index: number, element): void{
        this.elements.splice(index, 1, element);
    }
    swapElements(i: number, j: number): void{
        var tmp: any = this.elements[i];
        Vue.set(this.elements, i,this.elements[j]);
        Vue.set(this.elements, j, tmp);
    }
    printElements(){
        var print: string = ""
        for(var ele in this.elements){
            print += ele.toString() + " " ;
        }
        console.log(print);
    }
    createNewDraft(){
        
        var post: InProgressPost = this;
        var obj = this.json();
        console.log("CREATING DRAFT");
        api.post('posts/', obj).then(function(response){
            console.log(response);
            post.pk = response.data.pk;
            window.localStorage.setItem("inProgressPost", post.pk.toString());
            console.log("WE'RE SAVING WHAT POST WE'RE CURRENTLY EDITING");
            console.log("AND IT IS " + window.localStorage.getItem("inProgressPost"));
            post.status = PostStatus.Saved;
        })
    }
    json(): any{
        return {
            user: this.userPk,
            title: this.title,
            content: this.elements,
            likes: 0,
            comments: [],
            tags: this.tags,
            content_type: 0,
            grade: 0,
            length: 0,
            draft: this.draft,
        }
    }
    
    saveDraft(): void{
        var post: InProgressPost = this;
        this.status = PostStatus.Saving;
        api.put("posts/" + this.pk + "/", this.json()).then(function(response){
            console.log("DRAFT SAVED!");
            post.status = PostStatus.Saved;
        })
    }
    publishPost(): Promise<any>{
        return new Promise((resolve, reject) => {
            api.put("posts/" + this.pk + "/", this.json()).then(function(response){
                console.log("post published");
                resolve(response);
            }).catch(function(error){
                reject(error);
            })
        })
    }
}