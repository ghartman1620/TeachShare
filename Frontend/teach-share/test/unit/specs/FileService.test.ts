import { expect } from "chai";
import { mutations, getters, removeFile } from "../../../src/store_modules/files/FileService";
import FileService from "../../../src/store_modules/files/FileService";
import {actions as actionsfn} from "../../../src/store_modules/files/FileService";
import { FileState } from "../../../src/store_modules/files/state";
import { GenericFile, ModelMap } from "../../../src/models";

import Vue from "vue";
import Vuex from "vuex";
import store from "../../../src/store";
import { uploadFiles } from "../../../src/store_modules/files/FileService";

Vue.use(Vuex);

/* eslint-disable no-new */
let vueInstance = new Vue({
    el: "#app",
    // router,
    store,
    components: { },
    template: "<div/>"
});


// typescript 'require' workaround hack
declare function require(name: string);

// console.log("MUTATIONS: ", Object.keys(mutations));
const { CREATE, UPDATE, CHANGE_LIMIT, DELETE, CLEAR } = mutations;


function setup_state(): FileState {
    const state: FileState = {
        files: new ModelMap<GenericFile>(),
        limit: 0
    }
    return state;
}

describe("[FILES] CREATE should create a file", () => {
    it("should create one entry", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {};
        out[file.pk] = file;
        
        CREATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out as {});
        
    });
    it("should create multiple entries", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let file2 = new GenericFile("39dmf99dfma", 10);

        let out = {}
        out[file.pk] = file;
        CREATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        out[file2.pk] = file2;
        CREATE(state, file2);
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
        CREATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        let out2 = {}
        out2[file2.pk] = file2;
        CREATE(state, file2);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.not.eql(out2);
    });
    it("should create multiple duplicate-keyed entries", () => {
        const state = setup_state();
        let files = state.files as ModelMap<GenericFile>
    });
});

describe("[FILES] UPDATE should update a file", () => {
    it("should update one entry", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        UPDATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);
        

        // update entry
        let updatedFile: GenericFile = {...file, percent: 100};
        out[updatedFile.pk] = updatedFile;
        UPDATE(state, updatedFile);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.eql(out);
    });
    it("should create instead of updating a thought-to-be existing file", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        UPDATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        // update entry
        let updatedFile: GenericFile = {...file, percent: 100, pk: "differentid123"};
        out[updatedFile.pk] = updatedFile;
        let files2 = state.files as ModelMap<GenericFile>
        UPDATE(state, updatedFile);
        expect(files2.data).to.eql(out);
    });
});

describe("[FILES] DELETE deletes a file from the files object", () => {
    it("should delete one entry", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        UPDATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        // delete entry
        let deletedFile: GenericFile = {...file};
        DELETE(state, deletedFile);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.eql({});
    });
    it("should delete one entry", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.pk] = file;
        UPDATE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql(out);

        // delete entry
        let deletedFile: GenericFile = {...file};
        DELETE(state, deletedFile.pk);
        let files2 = state.files as ModelMap<GenericFile>
        expect(files2.data).to.eql({});
    });
    it("should delete one entry, when none exist", () => {

        // setup...
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        DELETE(state, file);
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql({});
    });
});
describe("[FILES] CLEAR", () => {
    it("should clear all files", () => {
        const state = setup_state();
        let file = new GenericFile("alphanumeric123", 0);
        UPDATE(state, file);
        let file2 = new GenericFile("alphanumeric456", 10);
        UPDATE(state, file2);
        CLEAR(state)
        let files = state.files as ModelMap<GenericFile>
        expect(files.data).to.eql({});
        let value = new ModelMap<GenericFile>(file, file2);
        expect(files.data).to.not.eql(value);
    });
});


const actionsInjector = require('inject-loader!../../../src/store_modules/files/FileService')

// create the module with our mocks
const actions = actionsInjector({
    'axios': {
        put(resolve, reject) {
            setTimeout(() => {
                resolve({});
            }, 100)
        }
    }
})

// helper for testing action with expected mutations
const testAction = (action, payload, state, expectedMutations, done) => {
    let count = 0
  
    // mock commit
    const commit = (type, payload) => {
        const mutation = expectedMutations[count]
        try {
            expect(mutation.type).to.equal(type)
            if (payload) {
                expect(mutation.payload).to.deep.equal(payload)
            }
        } catch (error) {
            done(error)
        } 
  
        count++
        if (count >= expectedMutations.length) {
            done()
        }
    }
  
    // call the action with mocked store and arguments
    action({ commit, state }, payload)
  
    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
      expect(count).to.equal(0)
      done()
    }
}


const blobToFile = (theBlob: Blob, fileName:string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
}


describe("[FILES] ACTIONS", () => {
    it("should complete the upload action", () => {
        let myBlob = new Blob();
        let myFile = blobToFile(myBlob, "test.txt");
        var files = [myFile];
        let store = vueInstance.$store;
        // upload(store, files).then(resp => {
        //     // console.log("RESP: ", resp)
        //     expect(resp.finished).to.equal(true);
        // });
    });
    it("should complete the remove action", () => {
        let file = new GenericFile("alphanumeric123", 0);

        store.dispatch("fs/remove_file", file).then(resp => {
            expect(resp).to.be.undefined;
        }).catch(err => expect(err).to.not.be.undefined);
    });
});
