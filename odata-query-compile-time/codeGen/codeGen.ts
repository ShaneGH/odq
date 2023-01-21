
import { ODataServiceConfig } from "odata-query-shared";
import { CodeGenConfig, SupressWarnings } from "../config.js";
import { edm } from "./edm.js";
import { ProcessedNamespace, ProcessedServiceConfig, processServiceConfig } from "./entities.js";
import { httpClient } from "./httpClient.js";
import { generateKeywords, imports } from "./keywords.js";
import { buildTab, configObj, lintingAndComments } from "./utils.js";

export function codeGen(serviceConfig: ODataServiceConfig, settings: CodeGenConfig | null | undefined, warnings: SupressWarnings | null | undefined) {

    const keywords = generateKeywords(Object.keys(serviceConfig.types), Object.keys(serviceConfig.types[""] || {}));
    const tab = buildTab(settings)

    // TODO: make module composition a bit nicer "module X { module Y { module Z { ..."
    const output = `
${imports(keywords, tab)}

${lintingAndComments()}

type TODO_Type = never

${httpClient(serviceConfig, tab, keywords, settings, warnings)}

${configObj(serviceConfig, keywords, settings, tab)}

${edm(tab)}

${entities()}`

    return output
        .replace(/\r\n/g, "\n")
        .replace(/s+\n/g, "\n") + "\n";

    function splitConfig(config: ProcessedServiceConfig) {
        return config;

        // TODO: good idea. Will allow us to export types for actual data, but keep 
        // non data types local. But some module reference issues
        return Object
            .keys(config)
            .reduce((s, x) => ({
                ...s,
                [x]: removeUtils(config[x]),
                [addUtilsNs(x)]: removeNonUtils(config[x])
            }), {} as ProcessedServiceConfig)

        function addUtilsNs(ns: string) {
            return ns ? `${keywords.ODataUtils}.${ns}` : keywords.ODataUtils
        }

        function removeUtils(ns: ProcessedNamespace): ProcessedNamespace {
            return Object
                .keys(ns)
                .reduce((s, x) => ({
                    ...s,
                    [x]: {
                        data: ns[x].data,
                        caster: null,
                        subPath: null,
                        query: null
                    }
                }), {} as ProcessedNamespace);
        }

        function removeNonUtils(ns: ProcessedNamespace): ProcessedNamespace {
            return Object
                .keys(ns)
                .reduce((s, x) => ({
                    ...s,
                    [x]: {
                        data: null,
                        caster: ns[x].caster,
                        subPath: ns[x].subPath,
                        query: ns[x].query
                    }
                }), {} as ProcessedNamespace);
        }
    }

    function entities() {
        const result = splitConfig(
            processServiceConfig(settings, tab, keywords, serviceConfig, warnings))

        return Object
            .keys(result)
            .map(x => x
                ? `export module ${x} {\n${tab(processModule(result[x]))}\n}`
                // TODO: test this case (with namespace == "")
                : processModule(result[x]))
            .join("\n\n");

        function processModule(module: ProcessedNamespace) {
            return Object
                .keys(module)
                .map(name => [
                    module[name].data,
                    module[name].query,
                    module[name].caster,
                    module[name].subPath
                ]
                    .filter(x => x)
                    .join("\n\n"))
                .join("\n\n")
        }

    }
}
