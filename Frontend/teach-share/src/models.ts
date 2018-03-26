
/**
 *  Model is the base implementation for a database-backed object
 */
export abstract class Model {
    public pk: number|string;
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
            type=FieldEnum.audio_file,
            url = ""}) {

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
    public user: User;
    public content: string;

    constructor(pk?: number, user?: User, content?: string) {
        super(typeof pk === "undefined" ? -1 : pk);
        this.user = typeof user === "undefined" ? new User(-1) : user;
        if (isString(content)) {
            this.content = content;
        } else {
            this.content =  "";
        }
    }
    public hasUser(): boolean {
        return this.user !== undefined;
    }
}

export class User extends Model {
    constructor(pk?: number) {
        super(typeof pk === "undefined" ? -1 : pk);
    }
}

export class Post extends Model {
    public comments: Comment[];
    public user: User;

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

    constructor(pk: string, percent = 0, file?: File, cancel?: any) {
        this.pk = pk;
        this.percent = percent;
        this.file = file;
        this.cancel = cancel;
    }
}

export interface RootState {
    user: User,
    comment: Comment,
    comments: Comment[],
    users: User[],

    // file upload
    files: any[],
    filesPercents: any[],

    // Post feed
    posts: Post[]
}

type Dictionary = {[id: string]: any};

/**
 * ModelMap is a structure for keeping track of a group of
 * model instances using an associative object.
 */
export class ModelMap<V> implements IterableIterator<V> {
    private _data: {[pk: string]: V} = {};
    private counter: number = 0;

    constructor(...V) {
        if (typeof V !== "undefined") {
            if (V.length < 1) {
                this._data = {};
                return;
            }
            for (let v of V) {
                this._data[v.pk] = v;
            }
        }
    }
    next(): IteratorResult<V> {
        let key = this.keys[this.counter];
        this.counter++;
        if (this.counter <= this.length) {
            return {
                done: false,
                value: this._data[key]
            }
        }
        return {
            done: true
        }
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this;
    }

    has(key: string): boolean {
        return typeof this.data[key] !== "undefined";
    }
    get keys(): string[] {
        return Object.keys(this._data);
    }
    get length(): number {
        return this.keys.length;
    }
    get data(): {[pk: string]: V} {
        return this._data;
    }
    set data(value: {[pk: string]: V}) {
        this._data = value;
    }
    set(key: string, value: V) {
        this._data[key] = value;
    }
    get(key: string): V{
        return this._data[key];
    }
}
