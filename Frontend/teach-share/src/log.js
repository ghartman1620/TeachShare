var moment = require("moment");

var LevelEnum = Object.freeze({
    "warning": {bg: "#ffdd00", fg: "#000000"},
    "danger": {bg: "#ff0a0a", fg: "#ffffff"},
    "success": {bg: "#03dd00", fg: "#000000"}
});

function $log (obj, level, fullObj) {
    var formatting = LevelEnum[level];
    var formattingStr;

    if (level === undefined || formatting === undefined) {
        formattingStr = "";
        level = "log";
    } else {
        formattingStr = `background: ${formatting.bg}; color: ${formatting.fg};`;
    }

    var str;
    var hasError = false;
    try {
        str = JSON.stringify(obj, null, 2);
    } catch (err) {
        console.log(`%c[error]: ${err}`, formattingStr);
        str = err;
        hasError = true;
    }
    var date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");

    if (hasError) {
        console.log("%c[object**]: ", formattingStr, obj);
    } else {
        console.log(`%c[${level}] --> ${date}:`, formattingStr);
        console.log(`${str}`);
    }
    if (fullObj === true) {
        console.log(Object.getOwnPropertyNames(obj));
    }
    console.log("");
};

export default $log;