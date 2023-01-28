import { IFilterUtils, newUtils as filter } from "./filterUtils.js";

export type Utils = {
    filter: IFilterUtils
}

export function utils(): Utils {
    return {
        filter: filter()
    }
}