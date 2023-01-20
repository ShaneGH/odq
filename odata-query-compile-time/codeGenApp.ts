import { existsSync, readFile, unlink, writeFile } from "fs";
import { codeGen } from "./codeGen/codeGen.js";
import { CodeGenConfig, Config } from "./config.js";
import { loadConfig, LocationType, XmlLocation } from "./odataConfigLoader.js";
import { processConfig } from "./odataConfigProcessor.js";

async function persist(code: string, file: string) {
    if (existsSync(file)) {
        await deleteFile(file);
    }

    await persistFile(file, code);
}

function deleteFile(file: string) {
    return new Promise((res, rej) => {
        unlink(file, err => err ? rej(err) : res(null));
    });
}

function loadFile(file: string) {
    return new Promise<string>((res, rej) => {
        readFile(file, (err, content) => err ? rej(err) : res(content.toString()));
    });
}

function persistFile(file: string, content: string) {
    return new Promise((res, rej) => {
        writeFile(file, content, err => err ? rej(err) : res(null));
    });
}

function loadConfigFile(location: string) {
    return loadFile(location)
        .then(x => JSON.parse(x) as Config)
}

export function generateCode(odataConfig: XmlLocation, settings: Config): Promise<string> {

    return loadConfig(settings, odataConfig)
        .then(x => processConfig(settings.warningSettings || {}, x))
        .then(x => codeGen(x, settings.codeGenSettings, settings.warningSettings));
}

export function generateTypescriptFile(configLocation: string): Promise<void> {

    return loadConfigFile(configLocation)
        .then(config => generateCode(getXmlLocation(config), config)
            .then(code => persist(code, outputFile(config))));

    function outputFile(config: Config) {
        if (!config.outputFileLocation) {
            throw new Error("outputFileLocation is not defined in config");
        }

        return config.outputFileLocation;
    }

    function getXmlLocation(config: Config): XmlLocation {
        const validation = [
            !!config.inputFileLocation?.fromFile,
            !!config.inputFileLocation?.fromString,
            !!config.inputFileLocation?.fromUri
        ]
            .filter(x => x)
            .length;

        if (validation !== 1) {

            throw new Error("You must specify exactly one of [inputFileLocation.fromFile, inputFileLocation.fromString, inputFileLocation.fromUri] in your config.");
        }

        if (config.inputFileLocation?.fromFile) {
            return {
                type: LocationType.FileLocation,
                path: config.inputFileLocation.fromFile
            };
        }


        if (config.inputFileLocation?.fromString) {
            return {
                type: LocationType.XmlString,
                xml: config.inputFileLocation.fromString
            };
        }


        return {
            type: LocationType.UriLocation,
            uri: config.inputFileLocation.fromUri as string
        };
    }
}