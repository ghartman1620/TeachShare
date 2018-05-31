import Vue from "vue";
import api from "./api";
import Database from "./Database";
import {ILayout, Post, User} from "./models";
import {asLoggedIn} from "./router/index";
import store from "./store";
import WebSocket from "./WebSocket";

export enum PostStatus {Loading, Saving, Saved}

export class InProgressPost {
    public elements: any[];
    public title: string;
    public tags: string[];
    public userPk: number;
    public status: PostStatus;
    public draft: boolean;
    public pk: number;
    // -1 if post is not yet saved as draft
    // supertags
    public grade: number;
    public contentType: number;
    public length: number;
    public subject: number;
    public standards: number[];
    public concepts: number[];
    public coreIdeas: number[];
    public practices: number[];
    public comments: any[];

    // just added
    public color: string;
    public layout: ILayout[];
    public original_user: number | undefined;
    public original_post: number | undefined;


    /*
     * Creates an InProgressPost to be edited. if the optional post parameter does not exist creates an empty post.
     * Otherwise, loads in data from the Post.
    */
    public constructor( userid: number, post?: Post) {
        
        if (post !== undefined) {

            this.elements = post.content ? post.content : [];
            this.title = post.title ? post.title : "";
            this.tags = post.tags ? post.tags : [];
            this.userPk = post.user.pk ? post.user.pk as number : -1;
            this.draft = post.draft ? post.draft : true;
            this.grade = post.grade ? post.grade : 0;
            this.contentType = post.content_type ? post.content_type : 0;
            this.length = post.length ? post.length : 0;
            this.subject = post.subject ? post.subject : 0;
            this.standards = post.standards ? post.standards : [];
            this.concepts = post.concepts ? post.concepts : [];
            this.coreIdeas = post.coreIdeas ? post.coreIdeas : [];
            this.practices = post.practices ? post.practices : [];
            this.comments = post.comments ? post.comments : [];
            // set defaults
            this.color = post.color ? post.color : "#96e6b3";
            this.layout = post.layout ? post.layout : [{
                x: 0,
                y: 0,
                w: 2,
                h: 30,
                i: "0", // This is how it was in the Django models as default
                        // as wierd as that seems...
            }];

            if (!post.pk) {
                console.error("InProgressPost error: constructor called with Post object with pk that does not exist");
            } else {
                this.pk = post.pk;
            }

        // I do believe this is currently never reached. Let's add a loud console error incase it is.
        } else {
            //this might happen if i change it to njust always make a new post when you refresh 
            
            console.error("Gabe was wrong!");
            console.error("Else condition reached in InProgressPost ctor - it was created with an undefined post!");
            this.elements = [];
            this.title = "";
            this.tags = [];
            this.userPk = userid;
            this.draft = true;
            this.pk = -1;
            this.grade = 0;
            this.subject = 0;
            this.contentType = 0;
            this.length = 0;
            this.standards = [];
            this.concepts = [];
            this.coreIdeas = [];
            this.practices = [];
            this.comments = [];
            // set defaults
            this.color = "#96e6b3";
            this.layout = [{
                x: 0,
                y: 0,
                w: 2,
                h: 30,
                i: "0", // This is how it was in the Django models as default 
                        // as wierd as that seems...
            }];
            this.original_user = undefined;
        }
    }

/*
    constructor(userid: number);
    constructor(userid: number, postid: number);
    constructor(userid: number, postid?: number){
        if (typeof postid !== "undefined"){ //there's a postid and a user
            // we're going to get that post and populate our InProgressPost with it
            //@TODO: use the Post model and store.ts. At the time of writing store.ts is being worked on
            //and I don't want to use it as a dependency while its being changed.
            this.elements = [];
            this.title = "";
            this.tags = [];
            this.layout = [];
            this.color = "#96e6b3";
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
            this.original_user = undefined;

            this.original_post = undefined;
            post.pk = postid;
            api.get("/posts/"+ postid).then(function(response){
                post.elements = response.data.content;
                post.title = response.data.title;
                post.draft = response.data.draft;
                post.tags = response.data.tags;
                post.layout = response.data.layout;
                post.color = response.data.color ? response.data.color : "#96e6b3"; 
                post.status = PostStatus.Saved;
                post.grade = response.data.grade;
                post.subject = response.data.subject;
                post.standards = response.data.standards;
                post.userPk = response.data.user;
                //response: #days hh:mm:ss
                post.length = parseInt(p.length.substring(p.length.length-2))/60
                            + parseInt(p.length.substring(p.length.length-5, p.length.length-3))
                            + Math.floor(parseInt(p.length.substring(p.length.length-8, p.length.length-6))*60)

                post.contentType = response.data.content_type;
                post.coreIdeas = response.data.coreIdeas;
                post.concepts = response.data.concepts;
                post.practices = response.data.practices;
                post.original_user = response.data.original_user;
                post.original_post = response.data.original_post;
                  
                post.layout = response.data.layout;
            })
        }
        else {//there's a user, lets make a new post
            this.elements = [];
            this.title = "";
            this.tags = [];
            this.color = "#96e6b3";
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
            this.original_user = undefined;
            this.original_post = undefined;
            
            this.layout = [];
            this.createNewDraft();
        }
    }
*/
    public setTags(tags: string[]): void {
        this.tags = tags;
        this.saveDraft();
    }
    setLayout(layout: ILayout[]): void {
        this.layout = layout;
        console.log("setting layotu!");
        console.trace();
        this.saveDraft();
    }
    setColor(color: string): void {
        this.color = color;
        this.saveDraft();
    }
    public setTitle(title: string): void {
        this.title = title;
        this.saveDraft();
    }
    public setGrade(grade: number): void {
        this.grade = grade;
    }
    public setContentType(contentType: number): void {
        this.contentType = contentType;
    }
    public setSubject(subject: number): void {
        this.subject = subject;
    }
    public setLength(length: number): void {
        this.length = length;
    }
    public setStandards(standards: number[]): void {
        this.standards = standards;
    }
    public setCoreIdeas(coreIdeas: number[]): void {
        this.coreIdeas = coreIdeas;
    }
    public setPractices(practices: number[]): void {
        this.practices = practices;
    }
    public setConcepts(concepts: number[]): void {
        this.concepts = concepts;
    }
    public addElement(element: any): void {
        this.elements.push(element);
    }
    public removeElement(index: number): void {
        this.elements.splice(index, 1);
    }
    public insertElement(index: number, element): void {
        this.elements.splice(index, 0, element);
    }
    public editElement(index: number, element): void {
        this.elements.splice(index, 1, element);
    }
    public swapElements(i: number, j: number): void {
        const tmp: any = this.elements[i];
        Vue.set(this.elements, i, this.elements[j]);
        Vue.set(this.elements, j, tmp);
    }

    public json(): any {
        return {
            user: this.userPk,
            title: this.title,
            content: this.elements,
            likes: 0,
            comments: [],
            tags: this.tags,
            layout: this.layout,
            color: this.color,
            content_type: this.contentType,
            grade: this.grade,
            length: `00:${this.length}:00`,
            draft: this.draft,
            subject: this.subject,
            standards: this.standards,
            crosscutting_concepts: this.concepts,
            disciplinary_core_ideas: this.coreIdeas,
            practices: this.practices,
            original_post: this.original_post,
        };
    }
    public toPost(): Post {
        const p: Post = new Post();
        p.comments = this.comments;
        p.user = new User(this.userPk);
        p.content = this.elements;
        p.content_type = this.contentType;
        p.draft = this.draft;
        p.grade = this.grade;
        p.length = this.length;
        p.subject = this.subject;
        p.tags = this.tags;
        p.title = this.title;
        p.standards = this.standards;
        p.concepts = this.concepts;
        p.coreIdeas = this.coreIdeas;
        p.comments = this.comments;
        p.color = this.color;
        p.layout = this.layout;
        p.practices = this.practices;
        p.pk = this.pk;
        p.original_post = this.original_post;
        return p;
    }
    public saveDraft(): void {
        const post: InProgressPost = this;
        this.status = PostStatus.Saving;
        /*api.put("posts/" + this.pk + "/", this.json()).then(function(response){
            post.status = PostStatus.Saved;
        })*/
        Database.getInstance().putPost(this.toPost(), 1); // @TODO: is this right?
        WebSocket.getInstance().sendUpdate(this.toPost());
        // in the future - potentially some kind of ack message sent back to indicate to user post was saved?
        this.status = PostStatus.Saved;
    }
    public publishPost(): Promise<any> {
        this.draft = false;
        return new Promise((resolve, reject) => {
            api.put("posts/" + this.pk + "/", this.json()).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
