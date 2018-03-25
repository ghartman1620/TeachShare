
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

    constructor(pk: number, file: string, description: string,
        filetype: string, name: string, title: string, type: FieldEnum, url: string) {
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

// 
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
