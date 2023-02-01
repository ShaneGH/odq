import { IFilterUtils, newUtils as filter } from "./filtering/filters.js";
import { ISelectUtils, newUtils as select } from "./selecting/select.js";

export type Utils = {
    filter: IFilterUtils
    select: ISelectUtils
}

export function utils(): Utils {
    return {
        filter: filter(),
        select: select()
    }
}