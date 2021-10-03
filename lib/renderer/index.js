"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Renderer = void 0;
var path = require("path");
var fs_1 = require("../fs");
var template_1 = require("./template");
var compiler_1 = require("./compiler");
var engine = require('../../package.json');
var Renderer = /** @class */ (function () {
    function Renderer(config) {
        this.engine = {
            author: engine.author,
            name: engine.name,
            version: engine.version,
            description: engine.description,
            keywords: engine.keywords,
            public: "/public/engine-" + engine.version + ".js"
        };
        this.template = new Map();
        this.app = {
            name: config.app.name,
            description: config.app.description
        };
        this.compiler = new compiler_1.Compiler();
    }
    Renderer.prototype.parse = function (directory, config) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, _i, _a, descriptor, content, template, id, _b, _c, template, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        entry = path.join(directory, config.renderer.entry);
                        _i = 0;
                        return [4 /*yield*/, fs_1["default"].readdir(directory, true)];
                    case 1:
                        _a = _e.sent();
                        _e.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        descriptor = _a[_i];
                        if (descriptor.ext !== '.jsx')
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, fs_1["default"].readfile(descriptor.absolute)];
                    case 3:
                        content = _e.sent();
                        template = new template_1.Template(this);
                        template.descriptor = descriptor;
                        return [4 /*yield*/, template.parse(content.toString(), descriptor)];
                    case 4:
                        if (!(_e.sent())) {
                            throw new Error("Failed to parse template contents");
                        }
                        if (entry === descriptor.absolute) {
                            this.entry = template;
                            return [3 /*break*/, 5];
                        }
                        id = path.join(descriptor.directory, descriptor.name)
                            .split(path.sep)
                            .filter(function (name) { return name.trim().length; })
                            .join('/');
                        this.template.set(id, template);
                        _e.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6:
                        if (this.entry == null) {
                            throw new Error("Undefined entry file");
                        }
                        _b = 0, _c = Array.from(this.template.values());
                        _e.label = 7;
                    case 7:
                        if (!(_b < _c.length)) return [3 /*break*/, 10];
                        template = _c[_b];
                        _d = template.context;
                        return [4 /*yield*/, this.compiler.bundle(this.entry, template)];
                    case 8:
                        _d.render = _e.sent();
                        _e.label = 9;
                    case 9:
                        _b++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Renderer.prototype.render = function (name, locale, data) {
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.template.get(name);
                        if (template == null) {
                            throw new Error("Undefined template name: " + name);
                        }
                        return [4 /*yield*/, template.render(locale, data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Renderer;
}());
exports.Renderer = Renderer;