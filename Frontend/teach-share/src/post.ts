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
    pk: number = -1; //-1 if post is not yet saved as draft

    interface IColorStyle {
        selector: string;
        color: string;
    }
    private _background: IColorStyle;
    get background() {
        return this._background;
    }
    set background(background: IColorStyle){
        this._background = background;
    }
    constructor(user: User){
        this.elements = [];
        this.title = "";
        this.tags = [];
        this.userPk = user.pk;
        this.attachments = [];
        this.background = IColorStyle {selector: ; string: ;};
        console.log(user);
        console.log("new post constructor");
        this.createDraft();
        
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

    setColor(color: string): void{
        this.background = IColorStyle {selector: ; string: ;};
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
    createDraft(){
        
        var post: InProgressPost = this;
        var obj = this.json(true);
        console.log("CREATING DRAFT");
        api.post('posts/', obj).then(function(response){
            console.log(response);
            post.pk = response.data.pk;
        })
    }
    json(draft: boolean): any{
        return {
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
            draft: draft,
        }
    }
    
    saveDraft(): void{
        api.put("posts/" + this.pk + "/", this.json(true)).then(function(response){
            console.log("DRAFT SAVED!");
        })
    }
    publishPost(): Promise<any>{
        return new Promise((resolve, reject) => {
            api.put("posts/" + this.pk + "/", this.json(false)).then(function(response){
                console.log("post published");
                resolve(response);
            }).catch(function(error){
                reject(error);
            })
        })
    }
}