
import api from "./api";


import Database from "./Database";
import WebSocket from "./WebSocket";

/**
 *  Model is the base implementation for a database-backed object
 */
export abstract class Model {
    public pk: number;
    constructor(pk: number) {
        this.pk = pk;
    }
}

/**
 * FieldEnum is an enum that represents the different string 'types' of a post
 * element.
 */
export enum FieldEnum {
    "file",
    "table",
    "video_file",
    "video_link",
    "audio_file"

}

/**
 * AudioElement is the audio component model
 */
export class AudioElement extends Model {
    public file: string;
    public type: FieldEnum = FieldEnum.audio_file;
    public description: string;
    public filetype: string;
    public name: string;
    public title: string;
    public url: string;

    constructor({
        pk = 0,
        file = "",
        description = "",
        filetype = "",
        name = "",
        title = "",
        type = FieldEnum.audio_file,
        url = ""
    }) {
        super(pk);
        this.file = file;
        this.description = description;
        this.filetype = filetype;
        this.name = name;
        this.type = type;
        this.title = title;
        this.url = url;
    }
}

export class FileElement extends Model {
    public type: FieldEnum = FieldEnum.file;

    constructor(pk) {
        super(pk);
    }
}

function isString(str: string | undefined): str is string {
    return (str as string) !== undefined;
}

export class Comment extends Model {
    public user?: User | number;
    public post?: Post | number;
    public text: string;

    constructor(
        pk?: number,
        post?: Post | number,
        user?: User | number,
        text?: string
    ) {
        super(typeof pk === "undefined" ? -1 : pk);
        this.user = user;
        this.post = post;
        if (isString(text)) {
            this.text = text;
        } else {
            this.text = "";
        }
    }
    public hasUser(): boolean {
        return this.user !== undefined;
    }
}

export class User extends Model {
    public username: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public token: string;
    public expires: Date;

    constructor(pk?: number) {
        super(typeof pk === "undefined" ? -1 : pk);
    }
}

export enum ContentType {
    Game = 0,
    Lab,
    Lecture
}



export enum NotifyType {
    "success",
    "danger",
    "info",
    "warning",
    "primary",
    "secondary",
    "dark",
    "light"
}

export interface INotification {
    id?: string;
    type: NotifyType;
    content: string;
}

export interface IRootState {}

/**
 * ModelMap is a structure for keeping track of a group of
 * model instances using an associative object.
 */

export class ModelMap<V> implements IterableIterator<V> {
    private _data: { [pk: string]: V } = {};
    private counter: number = 0;

    constructor(...V) {
        if (typeof V !== "undefined") {
            if (V.length < 1) {
                this._data = {};
                return;
            }
            for (const v of V) {
                this._data[v.pk] = v;
            }
        }
    }
    public next(): IteratorResult<V> {
        const key = this.keys[this.counter];
        this.counter++;
        if (this.counter <= this.length) {
            return {
                done: false,
                value: this._data[key]
            };
        } else {
            this.counter = 0;
        }
        return {
            done: true
        };
    }
    public [Symbol.iterator](): IterableIterator<V> {
        return this;
    }
    public has(key: string | number): boolean {
        return typeof this.data[String(key)] !== "undefined";
    }
    get keys(): string[] {
        return Object.keys(this._data);
    }
    get length(): number {
        return this.keys.length;
    }
    get data(): { [pk: string]: V } {
        return this._data;
    }
    set data(value: { [pk: string]: V }) {
        this._data = value;
    }
    public set(key: string, value: V) {

        this._data[key] = value;
    }
    public get(key: string | number): V {
        return this._data[String(key)];
    }
    public remove(key: string | number): boolean {
        return delete this._data[String(key)];
    }
    public list(): V[] {

        let res = new Array<V>();
        for (const k in this.data) {
            if (typeof k !== "undefined") {
                res.push(this.get(k));
            }
        }
        return res;
    }
}

export interface ILayout {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
}

export class Post extends Model {
    /*
     * Get a Post from the websocket connection or the database if contained.
     * @param pk the post to get
     * @param save? optionally indicate to save in the db and subscribe over websocket to this post.
    */
    public static get(pk: number, save?: boolean): Promise<Post> {
        console.log("getting a post: " + pk);
        console.log("Saving that post? " + save);
        return new Promise((resolve, reject) => {
            console.log("is in db?");
            this.db.getPost(pk).then(p => {
                console.log("it is in db!");
                p.pk = pk;
                resolve(p);
            }).catch( () => {
                console.log("it is not in db");
                if (save) {
                    Post.db.addEmptyPost(pk);
                    Post.ws.sendWatch(pk);
                    Post.ws.sendGet(pk);
                } else {
                    Post.ws.sendGet(pk);
                }
                reject();

            });
        });
    }
    // creates a Post model from the websocket serialized form (see idify for details)
    public static pkify(obj: any): Post {
        if (obj !== undefined) {
            console.log(obj);
            let p: any = {
                user: new User(obj.user_id),
                ...obj
            };
            delete p.user_id;

            p.pk = p.id;
            delete p.id;
            return p as Post;
        } else {
            console.error("pkify error: Post.pkify() called on undefined post");
            return new Post();
        }
    }
    private static db: Database = Database.getInstance();
    private static ws: WebSocket = WebSocket.getInstance();

    public comments: Comment[] | number[];
    public user: User;
    public attachments: any[];
    public content: any[];
    public content_type: ContentType;
    public draft: boolean;
    public grade: number;
    public length: number;
    public likes: number;
    public subject: number;
    public tags: string[];
    public timestamp: Date;
    public title: string;
    public updated: Date;
    public standards: number[];
    public concepts: number[];
    public coreIdeas: number[];
    public practices: number[];

    public color: string;
    public layout: ILayout[];
    public original_user: User;

    constructor(pk?: number, comments?: Comment[], user?: User) {
        super(typeof pk === "undefined" ? -1 : pk);
        this.comments = typeof comments === "undefined" ? [] : comments;
        this.user = typeof user === "undefined" ? new User() : user;

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
    }

    // Creates an object of the form the websocket requires for deserialization:
    // pk is known as id
    // user isn't an object, it's just a "user_id" with the pk/id of the user
    // no comments
    public toApiObject(): object {
        const obj: any = {
            user_id: this.user.pk,
            original_user_id: undefined,
            id: this.pk,
            disciplinary_core_ideas: this.coreIdeas,
            crosscutting_concepts: this.concepts,
            likes: 0,
            ...this as object,
        };
        console.log(obj, this.user.pk);
        delete obj.concepts;
        delete obj.coreIdeas;
        delete obj.pk;
        delete obj.user;
        delete obj.original_user;
        delete obj.comments;
        console.log(obj);
        return obj;
    }

}

export class GenericFile {
    public pk: string;
    public percent: number;
    public file: File | undefined;
    public cancel: any;
    public url: string | undefined;
    public name: string | undefined;

    constructor(
        pk: string,
        percent = 0,
        file?: File,
        cancel?: any,
        url?: string
    ) {
        this.pk = pk;
        this.percent = percent;
        this.file = file;
        this.cancel = cancel;
        this.url = url;
        if (file !== undefined) {
            this.name = file.name;
        }
    }
}
