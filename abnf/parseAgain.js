"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var fs_1 = require("fs");
var file = fs_1["default"].readFileSync("C:\\Dev\\odata-query\\abnf\\rules.txt").toString();
var charMap = file
    .split(/\r?\n/)
    .map(function (x) {
    var colon = x.indexOf(";");
    return colon === -1 ? x : x.substring(0, colon);
})
    .join("")
    .split("")
    .reduce(function (s, x) {
    var _a;
    return s[x] ? s : __assign(__assign({}, s), (_a = {}, _a[x] = true, _a));
}, {});
var chars = Object.keys(charMap);
console.log(chars.filter(function (x) { return !/^[a-zA-Z0-9]|\s$/.test(x); }));
