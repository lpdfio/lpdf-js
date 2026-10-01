"use strict";
/**
 * Shared types used by both the Node.js and browser entry points.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAttrs = buildAttrs;
/**
 * The attributes of an element: an attribute object's own properties, with each camelCase name
 * written as the schema's kebab-case one (`fontSize` as `font-size`) and each value as a string.
 * Properties that are `undefined` are left out.
 */
function buildAttrs(options) {
    const result = {};
    for (const [key, value] of Object.entries(options ?? {})) {
        if (value !== undefined && value !== null) {
            result[key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())] = String(value);
        }
    }
    return result;
}
