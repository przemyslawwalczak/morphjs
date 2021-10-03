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
exports.Compiler = void 0;
var template_1 = require("./template");
var vm = require("vm");
var fs = require("fs");
var Builder = /** @class */ (function () {
    function Builder() {
        this.script = [];
    }
    Builder.prototype.push = function (snippet) {
        this.script.push(snippet);
    };
    Builder.prototype.html = function (snippet) {
        this.script.push("html += `" + snippet + "`;");
    };
    Builder.prototype.toString = function () {
        return this.script.join('\r\n');
    };
    return Builder;
}());
var Compiler = /** @class */ (function () {
    function Compiler() {
    }
    Compiler.prototype.overrideHeadContainers = function (from, to) {
        if (to == null) {
            return from.children.map(function (children) {
                if (children instanceof template_1.Container) {
                    return children;
                }
            });
        }
        var result = [];
        for (var _i = 0, _a = from.children; _i < _a.length; _i++) {
            var container = _a[_i];
            if (container instanceof template_1.Expression) {
                continue;
            }
            if (container.name === 'title') {
                result.push(to.queryContainer('title') || container);
                continue;
            }
            if (container.name === 'meta') {
                result.push(container);
                continue;
            }
            if (container.name === 'link') {
                result.push(container);
                continue;
            }
        }
        console.log(result);
        return result;
    };
    Compiler.prototype.attribute = function (attribute, merge) {
        var result = [];
        for (var _i = 0, _a = Array.from(attribute.keys()); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = attribute.get(key);
            result.push(key + "=\"" + this.expression(value) + "\"");
        }
        return result.join(' ');
    };
    Compiler.prototype.expression = function (expression) {
        if (expression.type === 'literal') {
            // TODO: Escape value
            return expression.value;
        }
        if (!Array.isArray(expression.value)) {
            return '';
        }
        var variable = expression.value.map(function (value) {
            if (value.type === 'literal') {
                return value.value;
            }
        })
            .join('?.');
        return '${' + variable + '}';
    };
    Compiler.prototype.container = function (build, container) {
        if (container.children.length === 0) {
            build.html("<" + container.name + " " + this.attribute(container.attribute) + "/>");
            return;
        }
        build.html("<" + container.name + " " + this.attribute(container.attribute) + ">");
        for (var _i = 0, _a = container.children; _i < _a.length; _i++) {
            var children = _a[_i];
            if (children instanceof template_1.Container) {
                this.container(build, children);
                continue;
            }
            build.html(this.expression(children));
        }
        build.html("</" + container.name + ">");
    };
    Compiler.prototype.head = function (build, from, to) {
        build.html('<head>');
        for (var _i = 0, _a = this.overrideHeadContainers(from, to); _i < _a.length; _i++) {
            var container = _a[_i];
            this.container(build, container);
        }
        build.html('</head>');
    };
    Compiler.prototype.body = function (build, from, to) {
        build.html('<body>');
        build.html('</body>');
    };
    Compiler.prototype.bundle = function (entry, template) {
        return __awaiter(this, void 0, void 0, function () {
            var build, context;
            return __generator(this, function (_a) {
                build = new Builder();
                console.log(entry);
                context = {
                    // TODO: Merge
                    app: entry.context.app,
                    engine: entry.context.engine,
                    locale: entry.context.locale,
                    // NOTE: debugging information
                    console: console
                };
                // TODO: Import check, all dependencies
                // TODO: Fill & merge template context
                // TODO: Merge head meta.
                // TODO: Add engine script from public if it isn't in head yet.
                // TODO: Construct render function that can be called on server side (document, window access
                // means we need to run it on the browser).
                // TODO: Add any script imports to the bundle.
                build.push("async function render (data = {}) {");
                build.push("let html = '';");
                build.html('<!DOCTYPE html>');
                build.html('<html lang="en">');
                this.head(build, entry.head, template.head);
                this.body(build, entry.body, template.body);
                build.html('</html>');
                build.push("return html;");
                build.push("}");
                fs.writeFileSync(template.descriptor.swapExtension('.build.js'), build.toString());
                vm.runInNewContext(build.toString(), context);
                return [2 /*return*/, context.render];
            });
        });
    };
    return Compiler;
}());
exports.Compiler = Compiler;
