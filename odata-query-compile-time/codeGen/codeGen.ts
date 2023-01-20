
import { ODataServiceConfig } from "odata-query-shared";
import { CodeGenConfig, SupressWarnings } from "../config.js";
import { edm } from "./edm.js";
import { ProcessedNamespace, processServiceConfig } from "./entities.js";
import { httpClient } from "./httpClient.js";
import { imports } from "./imports.js";
import { generateKeywords } from "./keywords.js";
import { buildTab, configObj, linting } from "./utils.js";

export function codeGen(serviceConfig: ODataServiceConfig, settings: CodeGenConfig | null | undefined, warnings: SupressWarnings | null | undefined) {

    const keywords = generateKeywords(Object.keys(serviceConfig.types), Object.keys(serviceConfig.types[""] || {}));
    const tab = buildTab(settings)

    // TODO: make module composition a bit nicer "module X { module Y { module Z { ..."
    const output = `
${imports(keywords, tab)}

${linting()}

${configObj(serviceConfig, keywords, settings, tab)}

${edm(tab)}

${entities()}

${httpClient(serviceConfig, tab, keywords, settings, warnings)}`

    return output
        .replace(/\r\n/g, "\n")
        .replace(/s+\n/g, "\n") + "\n";

    function entities() {
        const result = processServiceConfig(settings, tab, keywords, serviceConfig, warnings)

        return Object
            .keys(result)
            .map(x => `export module ${x} {
${tab(processModule(result[x]))}
}`)
            .join("\n\n");


        function processModule(module: ProcessedNamespace) {
            return Object
                .keys(module)
                .map(name => [
                    module[name].data,
                    module[name].query,
                    module[name].caster
                ].join("\n\n"))
                .join("\n\n")
        }

    }
}
