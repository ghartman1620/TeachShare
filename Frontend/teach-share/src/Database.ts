import {Post} from "./models";
import idb from "idb";
import {DB} from "idb/lib/idb.d"

//A singleton Database connection class. 
//Users should call the static get_instance() function
export default class Database{
    private static instance: Database;
    dbPromise: Promise<DB>;
    private constructor() {
        
        this.dbPromise = idb.open("teachshare1", 1, upgradeDB => {
            upgradeDB.createObjectStore("posts", {keyPath: "pk"});
        }) 
    }

    // Is this thread safe? no lmao
    public static getInstance(): Database {
        if(Database.instance === undefined){
            Database.instance = new Database();
        }
        return Database.instance;
        
    }
    /*
        Returns a promise resolved when the given post p is saved to indexeddb.
    */
    public putPost(p: Post): Promise<void>{
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                const tx = db.transaction("posts", "readwrite");
                tx.objectStore("posts").put({
                    "pk" : p.pk,
                    "title" : p.title,
                    "content" : p.content,
                });
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
            this.dbPromise.then(db => {
                var tx =  db.transaction("posts")
                    .objectStore("posts").get(pk)
                .then(function(post){
                    if(post === undefined){
                        reject();
                    }
                    else{
                        var p: Post = Post.pkify(post);
                        resolve(p);
                    }
                })
            })
        })
    }
    public deletePost(pk: number): Promise<void>{
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                var tx =  db.transaction("posts", "readwrite")
                    .objectStore("posts").delete(pk)
                .then(function(){
                    resolve();
                })
            })
        })
    }



}