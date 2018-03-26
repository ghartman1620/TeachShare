import { expect } from "chai";
import { mutations, getters } from "../../../src/store_modules/file/FileService";
import {actions as actionsfn} from "../../../src/store_modules/file/FileService";
import { FileState } from "../../../src/store_modules/file/state";
import { GenericFile, ModelMap } from "../../../src/models";

// typescript 'require' workaround hack
declare function require(name: string);

console.log("MUTATIONS: ", Object.keys(mutations));
const { create_file, create_update_file, change_limit, delete_file, clear_files } = mutations;
;

function setup_state(): FileState {
    const state: FileState = {
        files: new ModelMap<GenericFile>(),
        limit: 0
    }
    return state;
}

describe("create_file should create a file", () => {
    it("should create one entry", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {};
        out[file.pk] = file;
        
        create_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out as {});
        
    });
    it("should create multiple entries", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let file2 = new GenericFile("39dmf99dfma", 10);

        let out = {}
        out[file.pk] = file;
        create_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        out[file2.pk] = file2;
        create_file(state, file2);
        let files2 = state.files as ModelMap<GenericFile>

        // let f = state.files.next().value as GenericFile;
        // let f2 = state.files.next().value as GenericFile;
        // console.log("FILE ITERATOR: ", f, f2);
        expect(files2.data).to.eql(out);
    });
    it("should create multiple duplicate-keyed entries", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let file2 = new GenericFile("alphanumeric123", 10);

        let out = {}
        out[file.pk] = file;
        create_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        let out2 = {}
        out2[file2.pk] = file2;
        create_file(state, file2);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.not.eql(out2);
    });
    it("should create multiple duplicate-keyed entries", () => {
        const state = setup_state();
        let files = state.files as ModelMap<GenericFile>
    });
});

describe("update_file should update a file", () => {
    it("should update one entry", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        create_update_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);
        

        // update entry
        let updatedFile: GenericFile = {...file, percent: 100};
        out[updatedFile.pk] = updatedFile;
        create_update_file(state, updatedFile);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.eql(out);
    });
    it("should create instead of updating a thought-to-be existing file", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        create_update_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        // update entry
        let updatedFile: GenericFile = {...file, percent: 100, pk: "differentid123"};
        out[updatedFile.pk] = updatedFile;
        let files2 = state.files as ModelMap<GenericFile>
        create_update_file(state, updatedFile);
        expect(files2.data).to.eql(out);
    });
});

describe("delete_file deletes a file from the files object", () => {
    it("should delete one entry", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        create_update_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        // delete entry
        let deletedFile: GenericFile = {...file};
        delete_file(state, deletedFile);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.eql({});
    });
    it("should delete one entry", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        create_update_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        // delete entry
        let deletedFile: GenericFile = {...file};
        delete_file(state, deletedFile.pk);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.eql({});
    });
    it("should delete one entry, when none exist", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        delete_file(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql({});
    });
});
describe("clear_files", () => {
    it("should clear all files", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        create_update_file(state, file);
        let file2 = new GenericFile("alphanumeric456", 10);
        create_update_file(state, file2);
        clear_files(state)
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql({});
        let value = new ModelMap<GenericFile>(file, file2);
        expect(files.data).to.not.eql(value);
    });
});


const actionsInjector = require('inject-loader!../../../src/store_modules/file/FileService')

// create the module with our mocks
const actions = actionsInjector({
    'axios': {
        put(resolve, reject) {
            setTimeout(() => {
                console.log(`RESOLVE: ${resolve}`, resolve);
                console.log(`REJECT: ${reject}`, reject);
                resolve({});
            }, 100)
        }
    }
})

// helper for testing action with expected mutations
const testAction = (action, payload, state, expectedMutations, done) => {
    console.log(action, payload, state, expectedMutations, done);
    let count = 0
  
    // mock commit
    const commit = (type, payload) => {
        console.log(`TYPE: ${type}`, type);
        console.log(`PAYLOAD: ${payload}`, payload);
        const mutation = expectedMutations[count]
        console.log(`MUTATION: ${mutation}`, mutation);
        try {
            console.log(mutation.type, type);
            expect(mutation.type).to.equal(type)
            if (payload) {
                console.log(payload);
                expect(mutation.payload).to.deep.equal(payload)
            }
        } catch (error) {
            console.log("ERROR: ", error);
            done(error)
        } 
  
        count++
        console.log(count);
        if (count >= expectedMutations.length) {
            console.log(count, expectedMutations.length);
            done()
        }
    }
  
    // call the action with mocked store and arguments
    console.log(commit, state, payload);
    action({ commit, state }, payload)
  
    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
      expect(count).to.equal(0)
      done()
    }
}


describe("actions", () => {
    it("file upload should work", (done) => {
        var f = document.createElement("form");
        f.setAttribute("method", "post");
        f.setAttribute("action", "");
        console.log(f);
        let fd = new FormData(f);
        console.log(fd);

        let myBlob = new Blob();
        let myFile = blobToFile(myBlob, "test.txt");
        // let file = new File(["one", "two"], "filename.txt", {
        //     type: "text/plain",
        // });
        console.log(myFile);
        
        var files = [myFile];
        fd.append("test.txt", myFile);
        console.log(fd);

        // let fl = new FileList();
        // for (var i = 0; i < files.length; i++) {
        //     fl[i] = files[i];
        // }

        // console.log(fl);
        console.log("ACTIONS:", actions);
        testAction(actions.file_upload, files, {}, [
            "saveDraft",
            "create_update_file",
            "create_update_file",
            "delete_file"
        ], done)

    });
});

const blobToFile = (theBlob: Blob, fileName:string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
}