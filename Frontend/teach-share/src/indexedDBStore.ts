
// In the following line, you should include the prefixes of implementations you want to test.
// const indexedDBConst = window.indexedDB ||
//                     window.mozIndexedDB ||
//                     window.webkitIndexedDB ||
//                     window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
// const IDBTransactionConst = window.IDBTransaction ||
//                         window.webkitIDBTransaction ||
//                         window.msIDBTransaction ||
//                         {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to
                                                    // support the object's constants for older browsers

// const IDBKeyRangeConst = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

let vkey = 0;
let dbn = "teach_store";

class IDBStore {
    private req: IDBOpenDBRequest;
    private db: IDBDatabase;
    private dbname: string;
    private actionQueue: any[];
    private store: IDBObjectStore;

    constructor(dbName: string, dbVer: number = 1) {
        this.load(dbName, dbVer);
    }

    get request(): IDBOpenDBRequest {
        return this.req;
    }

    get DB(): IDBDatabase {
        return this.db;
    }

    get DBName(): string {
        return this.dbname;
    }

    get Store(): IDBObjectStore {
        return this.store;
    }

    public load(dbName: string, versionKey?: number) {
        const request = window.indexedDB.open(dbName, versionKey);
        this.req = request;
        this.req.onsuccess = this.successHandler;
        this.req.onerror = this.errorHandler;
        this.req.onupgradeneeded = this.upgradeHandler;
    }

    private errorHandler = (event: Event) => {
        console.log("ERROR: ", event);
    }

    private successHandler = (event: Event) => {
        console.log("[SUCCESS HANDLER]");
        this.db = ((event.target as EventTarget) as any).result;
        const objStore = this.db.transaction("a", "readwrite").objectStore("a");
        let req = objStore.add({pk: 2, date: Date.now()});
        req.onsuccess = (evt) => {
            console.log("[SUCCESS]: ", evt);
        };
        req.onerror = (evt) => {
            console.log("[ERROR]: ", evt);
        };
        console.log("OBJSTORE: ", objStore);
    }

    private upgradeHandler = (event: Event) => {
        console.log("[UPGRADE HANDLER]");
        this.db = ((event.target as EventTarget) as any).result;
        const objStore = this.db.createObjectStore("a",  { keyPath: "pk" });
        console.log("[UPGRADE]", objStore);
        objStore.transaction.oncomplete = (evt) => {
            console.log(evt);
            let testStore = this.db.transaction("a", "readwrite").objectStore("a");
            testStore.add({pk: 1, date: Date.now()});
        };
    }
}

export default IDBStore;
