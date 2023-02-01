import { FilterUtils, newUtils as filter } from "./filtering/filters.js";
import { SelectUtils, newUtils as select } from "./selecting/select.js";

export type Utils = {
    filter: FilterUtils
    select: SelectUtils
}

export function utils(): Utils {
    return {
        filter: filter(),
        select: select()
    }
}