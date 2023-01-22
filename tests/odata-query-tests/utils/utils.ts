
export const uniqueString = (function () {
    let i = parseInt((new Date().getTime() / 100).toFixed());
    return (prefix = "string_") => `${prefix}${++i}`;
})();