
const fs = require("fs");

const file = fs.readFileSync("C:\\Dev\\odata-ts-client\\abnf\\rules.txt").toString();

const charMap = file
    .split(/\r?\n/)
    .map(x => {
        const colon = x.indexOf(";");
        return colon === -1 ? x : x.substring(0, colon);
    })
    .join("")
    .split("")
    .reduce((s, x) => s[x] ? s : { ...s, [x]: true }, {});

const chars = Object.keys(charMap);

console.log(chars.filter(x => !/^[a-zA-Z0-9]|\s$/.test(x)))

