import { FilterUtils, newUtils as filter } from "./filters.js";
import { SelectUtils, newUtils as select } from "./select.js";
import { ExpandUtils, newUtils as expand } from "./expand.js";
import { OrderingUtils, newUtils as orderBy } from "./orderBy.js";
import { paging } from "./paging.js";

export type Utils = {
    filter: FilterUtils
    select: SelectUtils
    expand: ExpandUtils,
    orderBy: OrderingUtils
    paging: typeof paging
}

export function utils(): Utils {
    return {
        filter: filter(),
        select: select(),
        expand: expand(),
        orderBy: orderBy(),
        paging
    }
}