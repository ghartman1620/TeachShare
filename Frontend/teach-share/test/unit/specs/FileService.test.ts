import { expect } from "chai";
import { mutations } from "../../../src/store_modules/file/FileService";
import actionsfn from "../../../src/store_modules/file/actions";
import { FileState } from "../../../src/store_modules/file/state";
import { GenericFile } from "../../../src/models";

// typescript 'require' workaround hack
declare function require(name: string);

console.log("MUTATIONS: ", Object.keys(mutations));
const { create_file, create_update_file, change_limit, delete_file } = mutations;


describe("create_file should create a file", () => {
    it("should create one entry", () => {
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.id] = file;

        create_file(state, file);

        console.log("out: ", out);
        expect(state.files).to.eql(out);
    });
    it("should create multiple entries", () => {
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let file2 = new GenericFile("39dmf99dfma", 10);

        let out = {}
        out[file.id] = file;
        create_file(state, file);
        expect(state.files).to.eql(out);

        out[file2.id] = file2;
        create_file(state, file2);
        expect(state.files).to.eql(out)
    });
    it("should create multiple duplicate-keyed entries", () => {
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let file2 = new GenericFile("alphanumeric123", 10);

        let out = {}
        out[file.id] = file;
        create_file(state, file);
        expect(state.files).to.eql(out);

        let out2 = {}
        out2[file2.id] = file2;
        create_file(state, file2);
        expect(state.files).to.not.eql(out2);
    });
    it("should create multiple duplicate-keyed entries", () => {
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let file2 = new GenericFile("alphanumeric123", 10);
        
        let out = {}
        out[file.id] = file;
        create_file(state, file);
        expect(state.files).to.eql(out);

        let out2 = {}
        out2[file2.id] = file2;
        create_file(state, file2);
        expect(state.files).to.not.eql(out2);
    });
});

describe("update_file should update a file", () => {
    it("should update one entry", () => {

        // setup...
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.id] = file;
        create_update_file(state, file);
        expect(state.files).to.eql(out);

        // update entry
        let updatedFile: GenericFile = {...file, percent: 100};
        out[updatedFile.id] = updatedFile;
        create_update_file(state, updatedFile);
        expect(state.files).to.eql(out);
    });
    it("should create instead of updating a thought-to-be existing file", () => {

        // setup...
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.id] = file;
        create_update_file(state, file);
        expect(state.files).to.eql(out);

        // update entry
        let updatedFile: GenericFile = {...file, percent: 100, id: "differentID123"};
        out[updatedFile.id] = updatedFile;
        create_update_file(state, updatedFile);
        expect(state.files).to.eql(out);
    });
});

describe("delete_file deletes a file from the files object", () => {
    it("should delete one entry", () => {

        // setup...
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.id] = file;
        create_update_file(state, file);
        expect(state.files).to.eql(out);

        // delete entry
        let deletedFile: GenericFile = {...file};
        delete_file(state, deletedFile);
        expect(state.files).to.eql({});
    });
    it("should delete one entry", () => {

        // setup...
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        let out = {}
        out[file.id] = file;
        create_update_file(state, file);
        expect(state.files).to.eql(out);

        // delete entry
        let deletedFile: GenericFile = {...file};
        delete_file(state, deletedFile.id);
        expect(state.files).to.eql({});
    });
    it("should delete one entry, when none exist", () => {

        // setup...
        const state: FileState = {
            files: {},
            limit: 0
        }
        let file = new GenericFile("alphanumeric123", 0);
        delete_file(state, file);
        expect(state.files).to.eql({});
    });
});


// const actionsInjector = require('inject-loader!../../../src/store_modules/file/actions')

// // create the module with our mocks
// const actions = actionsInjector({
//     '../api/shop': {
//         getProducts (cb) {
//             setTimeout(() => {
//             cb([ /* mocked response */ ])
//             }, 100)
//         }
//     }
// })

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


describe("actions", () => {
    it("file upload should work", (done) => {
       testAction(actionsfn.file_upload, null, {}, [

       ], done)

    });
});