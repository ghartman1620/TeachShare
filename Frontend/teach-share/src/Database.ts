import {Post} from "./models";
import idb from "idb";
import {DB} from "idb/lib/idb.d"

//A singleton Database connection class. 
//Users should call the static get_instance() function
export default class Database{
    private static instance: Database;
    dbPromise: Promise<DB>;
    private constructor() {
        
        this.dbPromise = idb.open("teachshare", 1, upgradeDB => {
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
     * Indicates that in the future the post with the given pk will be saved in the database
     * in websocket message receipt handlers. 
    */
    public addEmptyPost(pk: number): Promise<void> {
        console.log("db adding empty post " + pk);
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                console.log("db promise ");
                const tx = db.transaction("posts", "readwrite");
                console.log("adding empty post");
                var obj = {pk: pk};
                console.log(obj);
                tx.objectStore("posts").put(obj);
                resolve();
            })
        })
    }

    /*
        Returns a promise resolved when the given post p is saved to indexeddb.
    */
    public putPost(p: Post): Promise<void>{
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                const tx = db.transaction("posts", "readwrite");
                console.log("putting post:");
                console.log(p);
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
        console.log("getting post");
        return new Promise((resolve, reject) => {
            this.dbPromise.then(db => {
                console.log("db promise then");
                var tx =  db.transaction("posts")
                    .objectStore("posts").get(pk)
                .then(function(post){
                    console.log("getting");
                    if(post === undefined){
                        console.log("wtf");
                        reject();
                    }
                    else{
                        console.log("aaah");
                        var p: Post = Post.pkify(post);
                        resolve(p);
                    }
                }).catch(err => {console.log(err);})
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
Database.getInstance().deletePost(1);
