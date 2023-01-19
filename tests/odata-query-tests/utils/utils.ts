
export const uniqueString = (function () {
    let i = parseInt((new Date().getTime() / 10000).toFixed());
    return (prefix = "string_") => `${prefix}${++i}`;
})();