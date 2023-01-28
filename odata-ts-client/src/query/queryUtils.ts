import { IFilterUtils, newUtils as filter } from "./filters.js";

export type Utils = {
    filter: IFilterUtils
}

export function utils(): Utils {
    return {
        filter: filter()
    }
}