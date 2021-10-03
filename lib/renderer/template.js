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
exports.Template = exports.Exporter = exports.Importer = exports.Variable = exports.Module = exports.Container = exports.Expression = void 0;
var acorn = require("acorn");
var jsx = require("acorn-jsx");
var jsxOptions = {
    allowNamespacedObjects: true,
    allowNamespaces: true
};
/**
 * JSX Parser extension instance.
 */
var parser = acorn.Parser.extend(jsx(jsxOptions));
/**
 * Expression helper parser.
 */
var Expression = /** @class */ (function () {
    function Expression() {
    }
    /**
     * Callee recursive function to describe callee expressions.
     * @param node
     * @param result
     * @returns Expression
     */
    Expression.callee = function (node, result) {
        var callee = node.callee;
        var expression = new Expression();
        expression.type = 'callee';
        expression.arguments = [];
        for (var _i = 0, _a = node.arguments; _i < _a.length; _i++) {
            var argument = _a[_i];
            expression.arguments.push(Expression.of(argument));
        }
        if (callee.type === 'Identifier') {
            expression.value = callee.name;
            if (Array.isArray(result.value)) {
                result.value.push(expression);
            }
            return result;
        }
        expression.value = callee.property.name;
        var next = callee.object;
        switch (next.type) {
            case 'MemberExpression':
                this.member(next, result);
                break;
            case 'CallExpression':
                this.callee(next, result);
                break;
            case 'ThisExpression':
                this.identifier(next, result);
                break;
            default: throw new Error("Unahandled Expression.callee next type: " + next.type);
        }
        if (Array.isArray(result.value)) {
            result.value.push(expression);
        }
        return result;
    };
    /**
     * Recursive function to parse identifiers or this expressions.
     * @param node
     * @param result
     * @returns Expression
     */
    Expression.identifier = function (node, result) {
        var name = node.type === 'ThisExpression' ? 'this' : node.name;
        if (Array.isArray(result.value)) {
            result.value.push(Expression.from('literal', name));
            return result;
        }
        result.type = 'literal';
        result.value = name;
        return result;
    };
    /**
     *
     * @param node
     * @param result
     * @returns Expression
     */
    Expression.member = function (node, result) {
        var expression = new Expression();
        expression.type = 'literal';
        expression.value = node.property.name;
        var next = node.object;
        switch (next.type) {
            case 'ThisExpression':
            case 'Identifier':
                this.identifier(next, result);
                break;
            case 'MemberExpression':
                this.member(next, result);
                break;
            case 'CallExpression':
                this.callee(next, result);
                break;
            default: throw new Error("Unahdnled Expression.member next type: " + next.type);
        }
        if (Array.isArray(result.value)) {
            result.value.push(expression);
        }
        return result;
    };
    Expression.expression = function (node, result) {
        result.type = 'expression';
        result.value = [];
        var type = node.type;
        switch (type) {
            case 'Identifier':
            case 'ThisExpression': return this.identifier(node, result);
            case 'MemberExpression': return this.member(node, result);
            case 'CallExpression': return this.callee(node, result);
            case 'JSXExpressionContainer': return this.expression(node.expression, result);
            default: throw new Error("Unhandled Expression.expression type: " + type);
        }
    };
    Expression.attribute = function (node, result) {
        if (node.type === 'JSXExpressionContainer') {
            return this.expression(node, result);
        }
        if (node.type !== 'Literal') {
            throw new Error("Unhandled Expression.attribute type: " + node.type);
        }
        result.type = 'literal';
        result.value = node.value;
        return result;
    };
    Expression.text = function (node, result) {
        result.type = 'literal';
        // TODO: Only trim spaces in between values of element start and end.
        result.value = node.value;
        // const value = node.value.trim()
        // .replace(/\s+/g, ' ')
        // .split(' ')
        // .map(value => value.trim())
        // result.value = value.length > 1 ? value.join(' ') : node.value
        return result;
    };
    Expression.of = function (node) {
        var result = new Expression();
        switch (node.type) {
            case 'JSXAttribute': return this.attribute(node.value, result);
            case 'MemberExpression':
            case 'CallExpression':
            case 'Identifier':
            case 'ThisExpression': return this.expression(node, result);
            case 'JSXText': return this.text(node, result);
            case 'Literal':
                result.type = 'literal';
                result.value = node.value;
                return result;
        }
        throw new Error("Unhandled Expression.of type: " + node.type);
    };
    Expression.from = function (type, value) {
        var result = new Expression();
        result.type = type;
        result.value = value;
        return result;
    };
    return Expression;
}());
exports.Expression = Expression;
var Container = /** @class */ (function () {
    function Container(name, namespace) {
        if (name === void 0) { name = null; }
        if (namespace === void 0) { namespace = null; }
        this.name = name;
        this.namespace = namespace;
        this.attribute = new Map();
        this.children = [];
    }
    Container.prototype.queryContainer = function (name, query) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var children = _a[_i];
            if (children instanceof Expression) {
                continue;
            }
            if (children.name !== name) {
                continue;
            }
            if (query && typeof query === 'object') {
                if (query.namespace && query.namespace !== children.namespace) {
                    continue;
                }
            }
            return children;
        }
        return undefined;
    };
    Container.nameof = function (_a, target) {
        var node = _a.name;
        if (node.type === 'JSXIdentifier') {
            target.name = node.name;
            return target;
        }
        if (node.type === 'JSXNamespacedName') {
            target.namespace = node.namespace.name;
            return this.nameof(node, target);
        }
        if (node.type === 'JSXMemberExpression') {
            target.name = [];
            var current = node.object;
            while (current) {
                var type = current.type;
                if (type === 'JSXMemberExpression') {
                    target.name.push(current.property.name);
                    current = current.object;
                    continue;
                }
                if (type === 'JSXNamespacedName') {
                    target.namespace = current.namespace.name;
                    target.name.push(current.name.name);
                    current = current.object;
                    continue;
                }
                if (type === 'JSXIdentifier') {
                    target.name.push(current.name);
                    current = current.object;
                    continue;
                }
                throw new Error("Unhandled type: " + current.type);
            }
            target.name.reverse();
            target.name.push(node.property.name);
            return target;
        }
        console.log('target.element unhandled:', node.type);
        return target;
    };
    Container.of = function (node) {
        if (node.type !== 'JSXOpeningElement') {
            throw new Error("unhandled target.of: " + node.type);
        }
        var result = new Container();
        for (var _i = 0, _a = node.attributes; _i < _a.length; _i++) {
            var attribute = _a[_i];
            result.attribute.set(attribute.name.name, Expression.of(attribute));
        }
        return this.nameof(node, result);
    };
    return Container;
}());
exports.Container = Container;
var Module = /** @class */ (function () {
    function Module() {
        this.value = null;
        this.attribute = new Map();
    }
    return Module;
}());
exports.Module = Module;
var Variable = /** @class */ (function () {
    function Variable() {
    }
    return Variable;
}());
exports.Variable = Variable;
var Importer = /** @class */ (function () {
    function Importer() {
    }
    Importer.prototype.create = function (source) {
    };
    return Importer;
}());
exports.Importer = Importer;
var Exporter = /** @class */ (function () {
    function Exporter() {
    }
    return Exporter;
}());
exports.Exporter = Exporter;
var Template = /** @class */ (function () {
    function Template(renderer) {
        this.context = {
            locale: {}
            // TODO: context global variables and function declarations
            // TODO: context.render(data)
        };
        this.context.engine = renderer.engine;
        this.context.app = renderer.app;
        this["import"] = new Importer();
        this["export"] = new Exporter();
    }
    Template.prototype.element_html = function (childrens, parent) {
        if (parent) {
            throw new Error("Nested html element are not allowed");
        }
        var container = new Container('html');
        for (var _i = 0, childrens_1 = childrens; _i < childrens_1.length; _i++) {
            var children = childrens_1[_i];
            this.transverse(children, container);
        }
    };
    Template.prototype.element_head = function (childrens, parent) {
        if (!parent || parent.name !== 'html' || this.head) {
            throw new Error("Element head can only be nested once in html container");
        }
        this.head = new Container('head');
        for (var _i = 0, childrens_2 = childrens; _i < childrens_2.length; _i++) {
            var children = childrens_2[_i];
            this.transverse(children, this.head);
        }
    };
    Template.prototype.element_body = function (children, parent) {
        if (!parent || parent.name !== 'html' || this.body) {
            throw new Error("Element body can only be nested once in html container");
        }
        this.body = new Container('body');
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var node = children_1[_i];
            this.transverse(node, this.body);
        }
    };
    Template.prototype.element_meta = function (target, parent) {
        if (!parent || parent.name !== 'head') {
            throw new Error("Container meta can only be nested in head container");
        }
        parent.children.push(target);
    };
    Template.prototype.element_link = function (target, parent) {
        if (!parent || parent.name !== 'head') {
            throw new Error("Container link can only be nested in head container");
        }
        parent.children.push(target);
    };
    Template.prototype.element_title = function (target, children, parent) {
        if (!parent || parent.name !== 'head') {
            throw new Error("Container title can only be nested in head container");
        }
        for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
            var node = children_2[_i];
            this.transverse(node, target);
        }
        parent.children.push(target);
    };
    Template.prototype.element = function (_a, parent) {
        var openingElement = _a.openingElement, children = _a.children;
        var target = Container.of(openingElement);
        switch (target.name) {
            case 'html': return this.element_html(children, parent);
            case 'head': return this.element_head(children, parent);
            case 'body': return this.element_body(children, parent);
            case 'meta': return this.element_meta(target, parent);
            case 'link': return this.element_link(target, parent);
            case 'title': return this.element_title(target, children, parent);
        }
        if (!parent && !this.body) {
            this.body = target;
        }
        for (var _i = 0, children_3 = children; _i < children_3.length; _i++) {
            var node = children_3[_i];
            this.transverse(node, target);
        }
    };
    Template.prototype.expression = function (_a, parent) {
        var expression = _a.expression;
        switch (expression.type) {
            case 'JSXElement': return this.element(expression, parent);
            default: return console.log('unhandled expression:', expression.type);
        }
    };
    Template.prototype.expression_container = function (_a, parent) {
        var expression = _a.expression;
        if (expression.type === 'JSXEmptyExpression') {
            return null;
        }
        parent.children.push(Expression.of(expression));
    };
    Template.prototype.text = function (node, parent) {
        if (parent.name === 'head') {
            return null;
        }
        var text = Expression.of(node);
        var value = text.value;
        if (value.trim()) {
            parent.children.push(text);
        }
    };
    Template.prototype.import_declaration = function (node, parent) {
        if (parent) {
            throw new Error("Import declarations are required on top of document");
        }
        // const module = this.import.create(node.source.value)
        // for (const specifier of node.specifiers)
        // {
        //    console.log(specifier)
        // }
        // // this.importer
        // console.log(node)
    };
    Template.prototype.export_declaration = function (node, parent) {
        if (parent) {
            throw new Error("Import declarations are required on top of document");
        }
        var container = new Container();
    };
    Template.prototype.transverse = function (node, parent) {
        switch (node.type) {
            case 'ExpressionStatement': return this.expression(node, parent);
            case 'JSXExpressionContainer': return this.expression_container(node, parent);
            case 'JSXElement': return this.element(node, parent);
            case 'JSXText': return this.text(node, parent);
            case 'ImportDeclaration': return this.import_declaration(node, parent);
            case 'ExportDeclaration': return this.export_declaration(node, parent);
            case 'ExportDefaultDeclaration': return this.export_declaration(node, parent);
            default: return console.log('unhandled transverse:', node.type);
        }
    };
    Template.prototype.parse = function (content, descriptor) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a, node;
            return __generator(this, function (_b) {
                result = parser.parse(content, {
                    ecmaVersion: 'latest',
                    sourceType: 'module'
                });
                for (_i = 0, _a = result.body; _i < _a.length; _i++) {
                    node = _a[_i];
                    this.transverse(node, null);
                }
                return [2 /*return*/, true];
            });
        });
    };
    Template.prototype.render = function (locale, data) {
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var render;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        render = this.context.render;
                        if (typeof render !== 'function') {
                            throw new Error("Template missing render function");
                        }
                        // TODO: Select locale context
                        this.context.locale = {};
                        return [4 /*yield*/, Promise.resolve(render(data))];
                    case 1: 
                    // TODO: Extend data to context
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Template;
}());
exports.Template = Template;
