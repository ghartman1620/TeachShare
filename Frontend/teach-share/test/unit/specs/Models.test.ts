import { expect } from "chai";
import { GenericFile, ModelMap } from "../../../src/models";

describe("[MODELMAP<V>] ModelMap class should work", () => {
    it("should iterate, have keys, length", () => {
        let a = new GenericFile("key", 10, undefined, undefined);
        let b = new GenericFile("key2", 10, undefined, undefined);
        let c = new GenericFile("key3", 10, undefined, undefined);
        let files = new ModelMap<GenericFile>(a, b, c);
        let container: any[] = [];
        let keys: any[] = []
        for (let f of files) {
            let g = f as GenericFile;
            container.push(g);
            keys.push(g.pk);
        }
        expect(container).to.be.length(files.length);
        expect(container).to.be.length(3);
        expect(keys).to.eql(["key", "key2", "key3"]);
    });
    it("should be assignable like a dictionary", () => {
        let files = new ModelMap<GenericFile>();
        let a = new GenericFile("key", 10, undefined, undefined);

        // all you have to do is modify the data field
        files.data[a.pk] = a;
        expect(files).to.eql(new ModelMap<GenericFile>(a));
    });
    it("should be assignable with a set method", () => {
        let files = new ModelMap<GenericFile>();
        let a = new GenericFile("key", 10, undefined, undefined);
        files.set(a.pk, a);
        expect(files).to.eql(new ModelMap<GenericFile>(a));
    });
    it("should be able to use a get method to find data", () => {
        let files = new ModelMap<GenericFile>();
        let a = new GenericFile("key", 10, undefined, undefined);
        files.set(a.pk, a);
        expect(files.get(a.pk)).to.eql(a);
    });
});