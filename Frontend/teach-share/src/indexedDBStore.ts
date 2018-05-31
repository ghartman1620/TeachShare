
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
    }

    private successHandler = (event: Event) => {
        return new Promise((resolve, reject) => {
            this.db = ((event.target as EventTarget) as any).result;
            const objStore = this.db.transaction("a", "readwrite").objectStore("a");
            let req = objStore.add({pk: 2, date: Date.now()});
            req.onsuccess = (evt) => {
                resolve(evt);
            };
            req.onerror = (evt) => {
                reject(evt);
            };
        });
    }

    private upgradeHandler = (event: Event) => {
        this.db = ((event.target as EventTarget) as any).result;
        const objStore = this.db.createObjectStore("a",  { keyPath: "pk" });
        objStore.transaction.oncomplete = (evt) => {
            let testStore = this.db.transaction("a", "readwrite").objectStore("a");
            testStore.add({pk: 1, date: Date.now()});
        };
    }
}

export default IDBStore;
