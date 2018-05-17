import {Post} from "./models";
import idb from "idb";
import {DB} from "idb/lib/idb.d"

//A singleton Database connection class. 
//Users should call the static get_instance() function
export default class Database{
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
                let obj = {pk: pk};
                tx.objectStore("posts").put(obj);
                resolve();
            });
        });
    }

    /*
        Returns a promise resolved when the given post p is saved to indexeddb.
    */
    public putPost(p: Post): Promise<void>{
        return new Promise((resolve, reject) => {
            this.dbPromise.then((db) => {
                const tx = db.transaction("posts", "readwrite");
                tx.objectStore("posts").put(p);
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
                        let p: Post = Post.pkify(post);
                        resolve(p);
                    }
                }).catch((err) => {console.log(err);});
            });
        });
    }
    public deletePost(pk: number): Promise<void>{
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
}

Database.getInstance().deletePost(1);
