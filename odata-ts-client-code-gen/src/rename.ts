import { ODataEntitySetNamespaces, ODataEntitySets, ODataServiceConfig } from "odata-ts-client-shared";
import { Config } from "./config.js";

export function applyRenames(serviceConfig: ODataServiceConfig, settings: Config): ODataServiceConfig {

    serviceConfig = renameEntities(serviceConfig, settings.codeGenSettings?.rename?.namespaces?.entities || null)
    serviceConfig = renameEntityContainers(serviceConfig, settings.codeGenSettings?.rename?.namespaces?.entityContainers || null)

    return serviceConfig
}

function renameEntityContainers(serviceConfig: ODataServiceConfig, renames: { [key: string]: string } | null): ODataServiceConfig {
    if (!renames) {

        return serviceConfig
    }

    const rn = renames;
    return {
        ...serviceConfig,
        entitySets: Object
            .keys(serviceConfig.entitySets)
            .reduce((s, x) => ({
                ...s,
                [reNamespaceKey(x)]: reNamespaceVal(serviceConfig.entitySets[x])
            }), {} as ODataEntitySetNamespaces)
    }

    function reNamespaceKey(ns: string, printEntitySetName?: string) {

        if (rn[ns] == null) {
            return ns;
        }

        if (printEntitySetName) {
            console.log(`Renaming entity set: ${ns && `${ns}.`}${printEntitySetName} => ${rn[ns] && `${rn[ns]}.`}${printEntitySetName}`);
        }

        return rn[ns];
    }

    function reNamespaceVal(ns: ODataEntitySets): ODataEntitySets {
        return Object
            .keys(ns)
            .reduce((s, x) => ({
                ...s,
                [x]: {
                    ...ns[x],
                    namespace: reNamespaceKey(ns[x].namespace, x)
                }
            }), {} as ODataEntitySets)
    }
}

function renameEntities(serviceConfig: ODataServiceConfig, renames: { [key: string]: string } | null): ODataServiceConfig {
    if (!renames) {

        return serviceConfig
    }
    return serviceConfig

}