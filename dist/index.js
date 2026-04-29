"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoAttr = exports.Pdf = exports.CanvasTransform = exports.LpdfRenderError = exports.PdfEngine = void 0;
// ── Engine ────────────────────────────────────────────────────────────────────
var engine_1 = require("./engine");
Object.defineProperty(exports, "PdfEngine", { enumerable: true, get: function () { return engine_1.PdfEngine; } });
Object.defineProperty(exports, "LpdfRenderError", { enumerable: true, get: function () { return engine_1.LpdfRenderError; } });
// ── Canvas types ──────────────────────────────────────────────────────────────
var canvas_1 = require("./canvas");
Object.defineProperty(exports, "CanvasTransform", { enumerable: true, get: function () { return canvas_1.CanvasTransform; } });
// ── Facade ────────────────────────────────────────────────────────────────────
var pdf_1 = require("./pdf");
Object.defineProperty(exports, "Pdf", { enumerable: true, get: function () { return pdf_1.Pdf; } });
Object.defineProperty(exports, "NoAttr", { enumerable: true, get: function () { return pdf_1.NoAttr; } });
