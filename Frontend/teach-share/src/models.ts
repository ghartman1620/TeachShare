import Database from "./Database";
import api from "./api";

/**
 *  Model is the base implementation for a database-backed object
 */
export abstract class Model {
    public pk?: number | string;
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

enum ContentType {
    Game = 0,
    Lab,
    Lecture
}

export class Post extends Model {
    static db: Database = Database.getInstance();
    static get(pk: number): Promise<Post> {
        return new Promise((resolve, reject) => {
            this.db.getPost(pk).then(p => {
                resolve(p);
            }).catch(err => {
                api.get("/posts/" + pk)
                .then(resp => {
                    this.db.putPost(resp.data);
                    resolve( resp.data as Post);
                }).catch(error => {
                    reject("no such post");
                })
            })
        });
    }

    public pkify(): string {
        var obj: any = {
            user_id: this.user.pk,
            id: this.pk,
            ...this as Object,
        }
        delete obj.pk;
        delete obj.user;
        obj.comments = undefined;
        delete obj.comments;
        console.log(obj);
        return obj;        
    }

    public comments: Comment[] | number[];
    public user: User;
    public attachments: any[];
    public content: any[];
    public content_type: ContentType;
    public draft: boolean;
    public grade: number;
    public length: string;
    public likes: number;
    public subject: string|null|undefined;
    public tags: string[];
    public timestamp: Date;
    public title: string;
    public updated: Date;

    constructor(pk?: number, comments?: Comment[], user?: User) {
        super(typeof pk === "undefined" ? -1 : pk);
        this.comments = typeof comments === "undefined" ? [] : comments;
        this.user = typeof user === "undefined" ? new User() : user;
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
