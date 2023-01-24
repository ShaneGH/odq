import { utils as filter } from "./filterUtils.js";

export type Utils = {
    filter: typeof filter
}

export function utils(): Utils {
    return {
        filter: { ...filter }
    }
}