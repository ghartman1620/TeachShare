import { expect } from "chai";
import { mutations, getters } from "../../../src/store_modules/comments/CommentService";
import { CommentState } from "../../../src/store_modules/comments/state";
import { GenericFile, ModelMap } from "../../../src/models";

console.log("MUTATIONS: ", Object.keys(mutations));
const { } = mutations;