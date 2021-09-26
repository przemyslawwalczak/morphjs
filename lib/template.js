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
exports.Template = void 0;
var acorn = require("acorn");
var jsx = require("acorn-jsx");
var jsxOptions = {
    allowNamespacedObjects: true,
    allowNamespaces: true
};
var parser = acorn.Parser.extend(jsx(jsxOptions));
var Template = /** @class */ (function () {
    function Template() {
        this["import"] = [];
    }
    Template.prototype.transverse = function (node) {
        if (node.type === 'JSXElement') {
            return this.element(node);
        }
        switch (node.type) {
            case 'FunctionDeclaration': return this.declare_function(node);
            case 'ImportDeclaration': return this.declare_import(node);
            case 'ExportNamedDeclaration': return this.declare_export(node);
            case 'ExpressionStatement': return this.declare_expression(node);
            case 'JSXExpressionContainer': return this.declare_expression(node);
            case 'JSXText': return this.text(node);
            default: return console.log("transverse:", node.type);
        }
    };
    Template.prototype.internal_transverse = function (node) {
        if (node.type === 'JSXElement') {
            return this.internal_element(node);
        }
        return this.transverse(node);
    };
    /**
     * Template declaration functions.
     *
     */
    Template.prototype.declare_function = function (node) {
        var result = {
            type: 'function',
            name: node.id.name,
            block: null
        };
        function function_body(_a) {
            var body = _a.body;
            var result = [];
            return result;
        }
        if (node.body && node.body.body.length) {
            result.block = function_body(node);
        }
        // TODO: Map the declared function
    };
    Template.prototype.declare_import = function (node) {
        // console.log(node)
    };
    Template.prototype.declare_export = function (node) {
        // console.log(node)
    };
    /**
     * List of Elements that are special to template definition.
     *
     */
    Template.prototype.element_html = function (node) {
        if (node.children) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                this.internal_transverse(children);
            }
        }
    };
    Template.prototype.element_head = function (node) {
        if (node.children) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                this.internal_transverse(children);
            }
        }
    };
    Template.prototype.element_body = function (node) {
        if (node.children) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                this.transverse(children);
            }
        }
    };
    Template.prototype.element_metadata = function (node) {
    };
    Template.prototype.element_router = function (node) {
    };
    Template.prototype.element_route = function (node) {
    };
    Template.prototype.element_title = function (node) {
    };
    Template.prototype.element_base = function (node) {
    };
    Template.prototype.element_link = function (node) {
    };
    Template.prototype.element_meta = function (node) {
    };
    Template.prototype.element_script = function (node) {
    };
    Template.prototype.element_noscript = function (node) {
    };
    Template.prototype.element_template = function (node) {
    };
    /**
     * General internal routers for specific elements handlers to transverse.
     *
     */
    Template.prototype.internal_element = function (node) {
        var opening = node.openingElement;
        var name = this.nameof(opening).name;
        console.log('internal_element:', name);
        switch (name) {
            case 'title': return this.element_title(node);
            case 'base': return this.element_base(node);
            case 'link': return this.element_link(node);
            case 'meta': return this.element_meta(node);
            case 'script': return this.element_script(node);
            case 'noscript': return this.element_noscript(node);
            case 'template': return this.element_template(node);
            case 'html': return this.element_html(node);
            case 'body': return this.element_body(node);
            case 'head': return this.element_head(node);
            case 'metadata': return this.element_metadata(node);
            case 'router': return this.element_router(node);
            case 'route': return this.element_route(node);
            default: return console.log("undefined internal_element: " + name);
        }
    };
    Template.prototype.element = function (node) {
        var opening = node.openingElement;
        var _a = this.nameof(opening), name = _a.name, namespace = _a.namespace;
        if (namespace === 'app') {
            return this.internal_element(node);
        }
        switch (name) {
            case 'html':
            case 'body':
            case 'head':
            case 'script':
            case 'template':
                return this.internal_element(node);
        }
        console.log('element:', name);
        if (opening.attributes) {
            for (var _i = 0, _b = opening.attributes; _i < _b.length; _i++) {
                var attribute = _b[_i];
                this.attribute(attribute);
            }
        }
        if (node.children) {
            for (var _c = 0, _d = node.children; _c < _d.length; _c++) {
                var children = _d[_c];
                this.transverse(children);
            }
        }
    };
    /**
     * Expression definitions.
     *
     */
    Template.prototype.logical_expression = function (expression) {
    };
    Template.prototype.member_expression = function (expression) {
    };
    Template.prototype.call_expression = function (expression) {
    };
    Template.prototype.declare_expression = function (_a) {
        var expression = _a.expression;
        switch (expression.type) {
            case 'JSXElement': return this.element(expression);
            case 'LogicalExpression': return this.logical_expression(expression);
            case 'MemberExpression': return this.member_expression(expression);
            case 'CallExpression': return this.call_expression(expression);
            default: return console.log("declare_expression: " + expression.type);
        }
    };
    /**
     * Generic functions for any type of node.
     *
     */
    Template.prototype.text = function (node) {
    };
    Template.prototype.attribute = function (attribute) {
    };
    Template.prototype.nameof = function (node) {
        switch (node.type) {
            case 'JSXOpeningElement': return this.nameof(node.name);
            case 'JSXMemberExpression': {
                var names = [node.property.name];
                var current = node.object;
                while (current.type === 'JSXMemberExpression') {
                    names.push(current.property.name);
                    current = current.object;
                }
                var _a = this.nameof(current), name_1 = _a.name, namespace = _a.namespace;
                names.push(name_1);
                return {
                    name: names.reverse(),
                    namespace: namespace
                };
            }
            case 'JSXIdentifier': {
                return {
                    name: node.name,
                    namespace: null
                };
            }
            case 'JSXNamespacedName': {
                var name_2 = node.name, namespace = node.namespace;
                return {
                    name: name_2.name,
                    namespace: namespace.name
                };
            }
            default: throw new Error("Unhandled nameof type: " + node.type);
        }
    };
    /**
     * Template API method definitions open for calling outside Template class.
     *
     */
    Template.prototype.parse = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a, node;
            return __generator(this, function (_b) {
                result = parser.parse(content, {
                    ecmaVersion: 'latest',
                    sourceType: 'module'
                });
                // TODO: Distinguished parsed tree of blocks.
                for (_i = 0, _a = result.body; _i < _a.length; _i++) {
                    node = _a[_i];
                    this.transverse(node);
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
exports.Template = Template;
