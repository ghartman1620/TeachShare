var LevelEnum = Object.freeze({
    "warning": {bg: "#ffdd00", fg: "#000000"},
    "danger": {bg: "#ff0a0a", fg: "#ffffff"},
    "success": {bg: "#03dd00", fg: "#000000"}
});

function isString(str: String | undefined): str is String {
    return (<String>str) !== undefined;
}

function ln (depth) {
    var e = new Error();
    if (!e.stack) {
        try {
            // IE requires the Error to actually be throw or else the Error's 'stack'
            // property is undefined.
            throw e;
        } catch (e) {
            if (!e.stack) {
                return 0; // IE < 10, likely
            }
        }
    }
    var stack = isString(e.stack).toString().split(/\r\n|\n/);
    return stack[depth];
}

function logFull (level, depth, ...items) {
    for (let obj of items) {
        var formatting = LevelEnum[level];
        var formattingStr;
        var line = ln(depth);
        // console.log(line);

        if (level === undefined || formatting === undefined) {
            formattingStr = "";
            level = "log";
        } else {
            formattingStr = `background: ${formatting.bg}; color: ${formatting.fg};`;
        }

        var str;
        var hasError = false;
        try {
            str = JSON.stringify(obj, null, 4);
        } catch (err) {
            console.log(`%c[error]: ${err}`, formattingStr);
            str = err;
            hasError = true;
        }

        if (hasError) {
            console.log("%c[object**]: ", formattingStr, obj);
            console.log(line);
        } else {
            console.log(`%c[${level}]:`, formattingStr);
            console.log(line);
            console.log(`Object: ${str}`);
        }
    }
}

export default logFull;
