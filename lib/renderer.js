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
var fs_1 = require("./fs");
var acorn = require("acorn");
var jsx = require("acorn-jsx");
var jsxOptions = {
    allowNamespacedObjects: true,
    allowNamespaces: true
};
var parser = acorn.Parser.extend(jsx(jsxOptions));
var Template = /** @class */ (function () {
    function Template() {
    }
    Template.prototype.parse = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens, _i, tokens_1, token;
            return __generator(this, function (_a) {
                tokens = [];
                // TODO: Parse better tokens that are descriptful.
                // TODO: Bundle server code.
                // TODO: Bundle client code.
                // TODO: Expose server render code.
                // TODO: Expose client render code + boilerplate wrappers.
                // TODO: Avoid exporting whole classes but only the functions needed in order to make the interactions with dom.
                // TODO: Explain the Elements and their context.
                parser.parse(content, {
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                    onToken: tokens
                });
                console.log(tokens.length);
                for (_i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
                    token = tokens_1[_i];
                    console.log(token);
                    break;
                }
                return [2 /*return*/, true];
            });
        });
    };
    Template.prototype.render = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Template;
}());
var Renderer = /** @class */ (function () {
    // TODO: Server/Internal bundle
    // TODO: Client/External bundle
    function Renderer() {
        this.template = new Map();
    }
    Renderer.prototype.render = function (name, data) {
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.template.get(name);
                        if (template == null) {
                            throw new Error("Template : " + name + " not found");
                        }
                        return [4 /*yield*/, template.render(data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Renderer.prototype.parse = function (directory) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, descriptor, template, content;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0;
                        return [4 /*yield*/, fs_1["default"].readdir(directory, true)];
                    case 1:
                        _a = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        descriptor = _a[_i];
                        if (descriptor.ext !== '.jsx')
                            return [3 /*break*/, 5];
                        template = new Template();
                        return [4 /*yield*/, fs_1["default"].readfile(descriptor.absolute)];
                    case 3:
                        content = _b.sent();
                        console.log('Template :', descriptor.absolute);
                        return [4 /*yield*/, template.parse(content.toString())];
                    case 4:
                        if (!(_b.sent())) {
                            throw new Error("Failed to parse template contents");
                        }
                        this.template.set(descriptor.name, template);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return Renderer;
}());
exports.Renderer = Renderer;
