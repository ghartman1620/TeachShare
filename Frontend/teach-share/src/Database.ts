import {Post} from "./models";
import idb from "idb";
import {DB} from "idb/lib/idb.d"

// A singleton Database connection class. 
// Users should call the static get_instance() function

export interface IPostVersion {
    id: number;
    version: number;
}

export interface IVersionedPost {
    pk: number;
    version: number;
    post: Post;
}

export default class Database {
    // Is this thread safe? no lmao
    public static getInstance(): Database {
        if (Database.instance === undefined){
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private static instance: Database;

    private dbPromise: Promise<DB>;
    private constructor() {
        this.dbPromise = idb.open("teachshare", 1, (upgradeDB) => {
            upgradeDB.createObjectStore("posts", {keyPath: "pk"});
        });
    }

    /*
     * Indicates that in the future the post with the given pk will be saved in the database
     * in websocket message receipt handlers. 
    */
    public addEmptyPost(pk: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.dbPromise.then((db) => {
                const tx = db.transaction("posts", "readwrite");
                const obj = {pk};
                tx.objectStore("posts").put(obj);
                resolve();
            });
        });
    }

    /*
        Returns a promise resolved when the given post p is saved to indexeddb.
    */
    public putPost(p: Post, v: number): Promise<void>{
        return new Promise((resolve, reject) => {
            this.dbPromise.then((db) => {
                const tx = db.transaction("posts", "readwrite");
                const obj: IVersionedPost = {pk: p.pk, version: v, post: p};
                tx.objectStore("posts").put(obj);
                resolve();
            });
        });
    }
    /*
        Returns a promise that resolves with a Post model or errors if the post is not found in
        indexeddb.
    */
    public getPost(pk: number): Promise<Post>{
        return new Promise((resolve, reject) => {
            this.dbPromise.then((db) => {
                db.transaction("posts")
                .objectStore("posts").get(pk)
                .then((post) => {

                    if (post === undefined) {
                        reject();
                    } else {
                        const p: Post = Post.pkify(post.post);
                        resolve(p);
                    }
                }).catch((err) => console.error(err));
            });
        });
    }
    public deletePost(pk: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.dbPromise.then((db) => {
                db.transaction("posts", "readwrite")
                .objectStore("posts").delete(pk)
                .then(() => {
                    resolve();
                });
            });
        });
    }

    /*
        Returns a summary of all the posts saved in the db in the form {id: number, version: number}
    */
    public manifest(): Promise<IPostVersion[]> {
        return new Promise((resolve, reject) => {
            this.dbPromise.then((db) => {
                const tx = db.transaction("posts", "readonly");
                const keys: IPostVersion[] = [];
                const store = tx.objectStore("posts");
                store.iterateCursor((cursor) => {
                    if (!cursor) {
                        return;
                    }
                    // this is ok, because we only save Post objects, and their pk/id is always number
                    // also, if no version that we know of exists, we'll send that we have version 0 (the first version)
                    // so whatever we have gets replaced if any version is newer
                    keys.push({id: cursor.key as number, version: cursor.value.version ? cursor.value.version : 0});
                    cursor.continue();
                });
                tx.complete.then(() => {
                    resolve(keys);
                });
            });
        });
    }
}

// For debugging purposes: Everything in post create should work correctly, without getting stuck loading,
// With any permutation of the below two things commented out.

// clear all of the posts out of the database - for debugging purposes only!
// remove me in production or unnecessary performance loss will happen

Database.getInstance().manifest().then((manifest) => {
    for (const idAndVersion of manifest) {
        Database.getInstance().deletePost(idAndVersion!.id);
    }
});
// I also put this here so it happens on page load. It's as good a place as any.
// Again, for debugging purposes.

window.localStorage.removeItem("inProgressPost");
