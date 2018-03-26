// typescript 'require' workaround hack
declare function require(name: string);

// Load some necessary libraries
const uuidv4 = require("uuid/v4");

/**
 * Actions - file_upload, remove_file, change_limit, and clear_files.
 */

/**
 * file_upload - for handling file uploads.
 *
 * @TODO: Simplify/break up
 */
export const file_upload = async (context, formData) => {
    try {
        let postid = await context.dispatch("saveDraft");
        console.log(postid);
    } catch (err) {
        console.log(err);
    }

    let files = formData.getAll("files");
    console.log(files);

    var i = 0;
    // forEach(files, function (file) {
    //     var fileAlreadyUploaded = false;
    //     context.state.uploadedFiles.forEach(function (element) {
    //         if (element.file.name == file.name) {
    //             fileAlreadyUploaded = true;
    //         }
    //     });
    //     if (!fileAlreadyUploaded && i + context.state.uploadedFiles.length < context.state.limit) {
    //         var identifier = uuidv4();
    //         var cancelToken = axios.CancelToken;
    //         var source = cancelToken.source();
    //         let config = {
    //             onUploadProgress: progressEvent => {
    //                 let percentCompleted = Math.floor(
    //                     progressEvent.loaded * 100 / progressEvent.total
    //                 );
    //                 context.commit("CHANGE_UPLOADED_FILES", {
    //                     percent: percentCompleted,
    //                     file: file,
    //                     request_id: identifier,
    //                     cancelSource: source
    //                 });
    //             },
    //             cancelToken: source.token
    //         };
    //         api
    //             .put(`upload/${file.name}?id=${identifier}&post=${context.rootGetters.getCurrentPostId}`, file, config)
    //             .then(response => {
    //                 context.commit("UPDATE_UPLOAD_FILES", response);
    //                 context.commit("ADD_ATTACHMENT", response.data);
    //             })
    //             .catch(function (err) {
    //                 if (axios.isCancel(err)) {
    //                     context.commit("REMOVE_FILE", file);
    //                 } else {
    //                     console.error(err);
    //                 }
    //             });
    //     }
    //     i++;
    // });
}

export const remove_file = (state, file) => {
    state.commit("CANCEL_REQUEST");
    state.commit("REMOVE_FILE", file);
}

export const change_limit = (state, data) => {
    state.commit("CHANGE_FILE_LIMIT", data);
}

export const clear_files = (state) => {
    state.commit("CLEAR_UPLOADED_FILES");
}

export default {
    file_upload,
    remove_file,
    change_limit,
    clear_files
}
