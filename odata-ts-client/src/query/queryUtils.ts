import { FilterUtils, newUtils as filter } from "./filters.js";
import { SelectUtils, newUtils as select } from "./select.js";
import { ExpandUtils, newUtils as expand } from "./expand.js";

export type Utils = {
    filter: FilterUtils
    select: SelectUtils
    expand: ExpandUtils
}

export function utils(): Utils {
    return {
        filter: filter(),
        select: select(),
        expand: expand()
    }
}