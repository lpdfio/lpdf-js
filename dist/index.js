"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoAttr = exports.L = exports.CanvasTransform = exports.PageScope = exports.BuiltinFont = exports.Orientation = exports.Pin = exports.FieldType = exports.LpdfRenderError = exports.PdfEngine = void 0;
// ── Engine ────────────────────────────────────────────────────────────────────
var engine_1 = require("./engine");
Object.defineProperty(exports, "PdfEngine", { enumerable: true, get: function () { return engine_1.PdfEngine; } });
Object.defineProperty(exports, "LpdfRenderError", { enumerable: true, get: function () { return engine_1.LpdfRenderError; } });
// ── Constants for the schema's enumerations ───────────────────────────────────
var constants_1 = require("./constants");
Object.defineProperty(exports, "FieldType", { enumerable: true, get: function () { return constants_1.FieldType; } });
Object.defineProperty(exports, "Pin", { enumerable: true, get: function () { return constants_1.Pin; } });
Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return constants_1.Orientation; } });
Object.defineProperty(exports, "BuiltinFont", { enumerable: true, get: function () { return constants_1.BuiltinFont; } });
Object.defineProperty(exports, "PageScope", { enumerable: true, get: function () { return constants_1.PageScope; } });
// ── Canvas types ──────────────────────────────────────────────────────────────
var canvas_1 = require("./canvas");
Object.defineProperty(exports, "CanvasTransform", { enumerable: true, get: function () { return canvas_1.CanvasTransform; } });
// ── Facade ────────────────────────────────────────────────────────────────────
var L_1 = require("./L");
Object.defineProperty(exports, "L", { enumerable: true, get: function () { return L_1.L; } });
Object.defineProperty(exports, "NoAttr", { enumerable: true, get: function () { return L_1.NoAttr; } });
