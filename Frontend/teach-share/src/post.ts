import Vue from "vue";
import User from "./user";
import api from "./api";
interface PostElement{
    type: string;
}

interface TextElement extends PostElement{
    content: string;
}

interface AudioElement extends PostElement{
    
}






export default class InProgressPost{
    elements: any[];
    title: string;
    tags: string[];
    userPk: number;
    attachments: any[];
    pk: number; //undefined if post is not yet saved as draft

    constructor(user: User){
        this.elements = [];
        this.title = "";
        this.tags = [];
        this.userPk = 0;
        this.attachments = [];
        this.pk = undefined;
        console.log(user);
        console.log("new post constructor");
        this.saveDraft();
        
    }
    setTags(tags: string[]): void {
        this.tags = tags;
    }
    setTitle(title: string): void {
        this.title = title;
    }
    setAttachments(attachments: any[]): void {
        this.attachments = attachments;
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
    async saveDraft(){
        var obj = {
            ///user: ctx.rootGetters.getCurrentUser.profile.pk,
            user: this.userPk,
            title: this.title,
            content: this.elements,
            likes: 0,
            comments: [],
            tags: this.tags,
            attachments: this.attachments,
            content_type: 0,
            grade: 0,
            length: 0,
            pk: this.pk,
        };
        var response = await api.post("posts/", obj)
        console.log("draft saved!");
        console.log(response);

    }
}