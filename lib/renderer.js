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
exports.Renderer = exports.Template = void 0;
var fs_1 = require("./fs");
var vm = require("vm");
var AST = require("html-parse-stringify");
var prettify = require("pretty");
var encode = require("escape-html");
var Sandbox = /** @class */ (function () {
    function Sandbox(renderer) {
        this.script = '';
        this.context = {
            console: console,
            // console: {
            //    error: () => {},
            //    log: () => {},
            //    info: () => {}
            // },
            renderer: renderer
        };
        this.virtual = vm.createContext(this.context);
    }
    Sandbox.prototype.append = function (code) {
        this.script += code + '\r\n';
        return this;
    };
    Sandbox.prototype.render = function (data) {
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof this.context.render !== 'function') {
                            throw new Error("Invalid virtual template renderer function");
                        }
                        return [4 /*yield*/, this.context.render(data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Sandbox;
}());
var Template = /** @class */ (function () {
    function Template(context) {
        this.sandbox = new Sandbox(context);
    }
    Template.prototype._metadata = function (node) {
    };
    Template.prototype._locale = function (node) {
    };
    Template.prototype._title = function (node) {
    };
    Template.prototype._script = function (node) {
        if (node.attrs.sandbox == null) {
            this.sandbox.append("html += '<script" + this._attributes(node) + ">';");
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                if (children.type === 'text') {
                    this._text(children, false);
                }
            }
            this.sandbox.append("html += '</script>';");
            return;
        }
        this.sandbox.append("try {");
        for (var _b = 0, _c = node.children; _b < _c.length; _b++) {
            var children = _c[_b];
            // if (children.type === 'tag')
            // {
            //    this._tag(children)
            //    continue
            // }
            if (children.type === 'text') {
                this.sandbox.append(children.content);
            }
        }
        this.sandbox.append("} catch(e) { console.error(e); }");
    };
    Template.prototype._render = function (node) {
        this.sandbox.append("html += await renderer.internal('" + node.attrs.template + "', this);");
    };
    Template.prototype._element = function (node) {
        if (node.voidElement) {
            return this.sandbox.append("html += '<" + node.name + this._attributes(node) + " />';");
        }
        this.sandbox.append("html += '<" + node.name + this._attributes(node) + ">';");
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var children = _a[_i];
            if (children.type === 'tag') {
                this._tag(children);
                continue;
            }
            if (children.type === 'text') {
                this._text(children);
                continue;
            }
        }
        this.sandbox.append("html += '</" + node.name + ">';");
    };
    Template.prototype._tag = function (node) {
        switch (node.name) {
            case 'app:metadata': return this._metadata(node);
            case 'app:locale': return this._locale(node);
            case 'title': return this._title(node);
            case 'script': return this._script(node);
            case 'render': return this._render(node);
            default: return this._element(node);
        }
    };
    Template.prototype._text = function (node, escaped) {
        if (escaped === void 0) { escaped = true; }
        if (!escaped) {
            this.sandbox.append("html += '" + node.content.trim().replace(/[\\$'"]/g, "\\$&") + "';");
        }
        else {
            this.sandbox.append("html += '" + encode(node.content.trim()) + "';");
        }
    };
    Template.prototype._attributes = function (node) {
        var keys = Object.keys(node.attrs);
        if (keys.length === 0) {
            return '';
        }
        var body = ' ';
        body += keys.map(function (key) {
            var value = node.attrs[key].trim();
            if (value.length === 0) {
                return "" + key;
            }
            if (value.indexOf('{') === 0 && value.lastIndexOf('}') === value.length - 1) {
                return key + "=" + value;
            }
            return key + "=\"" + value + "\"";
        })
            .join(' ');
        return body;
    };
    Template.prototype.parse = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var content, _i, _a, node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fs_1["default"].readfile(file.absolute)];
                    case 1:
                        content = _b.sent();
                        this.sandbox.context.name = file.absolute;
                        this.sandbox.append('async function render(data = {}) {');
                        this.sandbox.append('let html = ``;');
                        for (_i = 0, _a = AST.parse(content.toString('utf-8')); _i < _a.length; _i++) {
                            node = _a[_i];
                            if (node.type === 'tag') {
                                this._tag(node);
                                continue;
                            }
                            if (node.type === 'text') {
                                this._text(node);
                                continue;
                            }
                        }
                        this.sandbox.append('return html;');
                        this.sandbox.append('}');
                        console.log(this.sandbox.script);
                        vm.runInContext(this.sandbox.script, this.sandbox.context);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Template.prototype.render = function (data, pretty) {
        if (data === void 0) { data = {}; }
        if (pretty === void 0) { pretty = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!pretty) return [3 /*break*/, 2];
                        _a = prettify;
                        return [4 /*yield*/, this.sandbox.render(data)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    case 2: return [4 /*yield*/, this.sandbox.render(data)];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return Template;
}());
exports.Template = Template;
var Renderer = /** @class */ (function () {
    function Renderer() {
        this.template = new Map();
    }
    Renderer.prototype.parse = function (directory) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, file, template;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0;
                        return [4 /*yield*/, fs_1["default"].readdir(directory, true)];
                    case 1:
                        _a = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        file = _a[_i];
                        if (file.ext !== '.html') {
                            return [3 /*break*/, 4];
                        }
                        template = new Template(this);
                        return [4 /*yield*/, template.parse(file)];
                    case 3:
                        if (!(_b.sent())) {
                            // console.error(template.error)
                            return [3 /*break*/, 4];
                        }
                        console.log('registered template:', file.name);
                        this.template.set(file.name, template);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Renderer.prototype.internal = function (name, data) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.template.get(name);
                        if (template == null) {
                            throw new Error("Template not found: " + name);
                        }
                        return [4 /*yield*/, template.render(data, false)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Renderer.prototype.external = function (name, data) {
        return __awaiter(this, void 0, void 0, function () {
            var template, start, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.template.get(name);
                        if (template == null) {
                            throw new Error("Template not found: " + name);
                        }
                        start = process.hrtime.bigint();
                        return [4 /*yield*/, template.render(data, false)];
                    case 1:
                        result = _a.sent();
                        console.log('rendered in:', parseInt((process.hrtime.bigint() - start).toString()) / 1000000, 'ms');
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return Renderer;
}());
exports.Renderer = Renderer;
