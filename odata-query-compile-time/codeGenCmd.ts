import { generateTypescriptFile } from "./codeGenApp.js";

export function executeCodeGen(args: string[]) {
    // TODO: more configurable args
    if (args.length !== 2) {
        exn();
    }

    // TODO: default config location
    if (args[0] !== "--config") {
        exn();
    }

    return generateTypescriptFile(args[1])

    function exn() {
        throw new Error("1 argument required: --config {{config file location}}");
    }
}