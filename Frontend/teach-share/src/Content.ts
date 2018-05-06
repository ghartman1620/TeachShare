import {Post} from "./models";

export default class Db{

    static db: IDBDatabase;

    // Generates the IDBRequest object if necessary and returns it.
    // Prefer this over getting Db.db explicitly because of the undefined check.
    static getDb(): IDBDatabase {
        if(Db.db === undefined){
            //unsure about version number - mozilla docs example uses 4 so i'll copy them
            var openRequest: IDBRequest = window.indexedDB.open("teachshare", 4);
            openRequest.onerror = function(){
                console.error("There was a problem opening indexeddb.");
            }
            openRequest.onsuccess = function(){
                console.log("Succesful indexeddb open");
                Db.db = openRequest.result;
            }
        }
        return Db.db;
    }

    static putPost(p: Post) {
        
        console.log("Implement putPost");
    }

};