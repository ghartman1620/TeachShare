import { expect } from "chai";
import IDBStore from "../../../src/indexedDBStore";

describe("[indexedDBStore] has a constructor and load db method", () => {
    it("has a constructor", () => {
        let idbs = new IDBStore("test", 1);
        expect(idbs).to.not.equal(undefined);
    });
    it("has invalid constructor 'version key' variable", () => {
        let f = IDBStore.bind(null, "test", 0);
        expect(f).to.throw(TypeError);
    });
});
describe("[indexedDBStore] has a request member variable", () => {
    it("has a request member variable", () => {
        const idbs = new IDBStore("default", 1);
        
    });
});
