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
    //supertags
    grade: number;
    contentType: number;
    length: number;
    subject: number;
    standards: number[];
    concepts: number[];
    coreIdeas: number[];
    practices: number[];
    /*

    */ 
   
    //@TODO: instead of dealing with window localstorage here this should accept
    //a post model as a parameter. Then window local storage should be delt with in PostCreate.
    //This is currently bad design - what if some module that doens't care about the state of local storage 
    //(for example, when we go to allow users to integrate elements of another user's post into their own)
    //wants to use InProgressPost?


    constructor(userid: number);
    constructor(userid: number, postid: number);
    constructor(userid: number, postid?: number){
        if (typeof postid !== "undefined"){ //there's a postid and a user
            console.log("WE'RE GETTING A PREVIOUSLY EDITED POST!");
            // we're going to get that post and populate our InProgressPost with it
            //@TODO: use the Post model and store.ts. At the time of writing store.ts is being worked on
            //and I don't want to use it as a dependency while its being changed.
            this.elements = [];
            this.title = "";
            this.tags = [];
            this.userPk = userid;
            var post: InProgressPost = this;
            this.status = PostStatus.Loading;
            this.draft = false;
            this.grade = 0;
            this.subject = 0;
            this.contentType = 0;
            this.length = 0;
            this.standards = [];
            this.concepts = [];
            this.coreIdeas = [];
            this.practices = [];
            post.pk = postid;
            api.get("/posts/"+ postid).then(function(response){
                console.log(response);
                post.elements = response.data.content;
                post.title = response.data.title;
                post.draft = response.data.draft;
                post.tags = response.data.tags;
                post.status = PostStatus.Saved;
                post.grade = response.data.grade;
                post.subject = response.data.subject;
                post.standards = response.data.standards;
                console.log("subject: " + response.data.subject);
                //response: #days hh:mm:ss
                console.log(response.data.length);
                post.length = parseInt(response.data.length.substring(response.data.length.length-2))/60
                            + parseInt(response.data.length.substring(response.data.length.length-5, response.data.length.length-3))
                            + Math.floor(parseInt(response.data.length.substring(response.data.length.length-8, response.data.length.length-6))*60)

                console.log(post.length);
                post.contentType = response.data.content_type;
                post.coreIdeas = response.data.coreIdeas;
                post.concepts = response.data.concepts;
                post.practices = response.data.practices;
            })
            console.log("returning from post constructor");
        }
        else {//there's a user, lets make a new post
            console.log("WE'RE MAKING A NEW POST!");
            this.elements = [];
            this.title = "";
            this.tags = [];
            this.userPk = userid;
            this.status = PostStatus.Saving;
            this.draft = true;
            this.grade = 0;
            this.subject = 0;
            this.contentType = 0;
            this.length = 0;
            this.standards = [];
            this.concepts = [];
            this.practices = [];
            this.coreIdeas = [];
            this.createNewDraft();
        }
    }
    setTags(tags: string[]): void {
        this.tags = tags;
    }
    setTitle(title: string): void {
        this.title = title;
    }
    setGrade(grade: number): void {
        this.grade = grade;
    }
    setContentType(contentType: number): void {
        this.contentType = contentType;
    }
    setSubject(subject: number): void {
        this.subject = subject;
    }
    setLength(length: number): void {
        this.length = length;
    }
    setStandards(standards: number[]): void {
        this.standards = standards;
    }
    setCoreIdeas(coreIdeas: number[]): void {
        this.coreIdeas = coreIdeas;
    }
    setPractices(practices: number[]): void {
        this.practices = practices;
    }
    setConcepts(concepts: number[]): void {
        this.concepts = concepts;
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
            content_type: this.contentType,
            grade: this.grade,
            length: `00:${this.length}:00`,
            draft: this.draft,
            subject: this.subject,
            standards: this.standards,
            crosscutting_concepts: this.concepts,
            disciplinary_core_ideas: this.coreIdeas,
            practices: this.practices,
        }
    }
    
    saveDraft(): void{
        var post: InProgressPost = this;
        this.status = PostStatus.Saving;
        console.log(this.json());
        console.log(this.standards);
        api.put("posts/" + this.pk + "/", this.json()).then(function(response){
            console.log("DRAFT SAVED!");
            console.log(response);
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