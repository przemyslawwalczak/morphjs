"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var fs = require("fs");
var jsxOptions = {
    allowNamespacedObjects: true,
    allowNamespaces: true
};
var parser = acorn.Parser.extend(jsx(jsxOptions));
var Attribute = /** @class */ (function () {
    function Attribute() {
        this.internal = false;
    }
    Attribute.literal = function (attribute, _a) {
        var value = _a.value;
        attribute.value = value;
        return attribute;
    };
    Attribute.expression = function (attribute, _a) {
        // console.log(expression)
        var expression = _a.expression;
        switch (expression.type) {
            case 'CallExpression':
                {
                    attribute.type = 'function';
                    break;
                }
            case 'MemberExpression':
                {
                    attribute.type = 'variable';
                    break;
                }
        }
        var name = nameof(expression).name;
        console.log('target:', name);
        return attribute;
    };
    Attribute.fromNode = function (node) {
        if (node.type !== 'JSXAttribute') {
            throw new Error("Sanity Check: JSXAttribute !== " + node.type);
        }
        var _a = nameof(node.name), name = _a.name, namespace = _a.namespace;
        var value = node.value;
        var attribute = new Attribute();
        attribute.name = name;
        attribute.namespace = namespace;
        switch (value.type) {
            case 'Literal': return this.literal(attribute, value);
            case 'JSXExpressionContainer': return this.expression(attribute, value);
            default: throw new Error("Unhandled attribute value type: " + value.type);
        }
    };
    return Attribute;
}());
function nameof(node) {
    switch (node.type) {
        case 'Identifier':
            {
                return {
                    name: [node.name],
                    namespace: null
                };
            }
        case 'MemberExpression':
            {
                var names = [];
                var object = node.object;
                while (object) {
                    if (object.type === 'Identifier') {
                        names.push(object.name);
                        break;
                    }
                    names.push(object.property.name);
                    object = object.object;
                }
                names.reverse();
                names.push(node.property.name);
                return {
                    name: names,
                    namespace: null
                };
            }
        case 'JSXOpeningElement': return nameof(node.name);
        case 'JSXMemberExpression': {
            var names = [node.property.name];
            var current = node.object;
            while (current.type === 'JSXMemberExpression') {
                names.push(current.property.name);
                current = current.object;
            }
            var _a = nameof(current), name_1 = _a.name, namespace = _a.namespace;
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
}
var Element = /** @class */ (function () {
    function Element() {
        this.attribute = [];
    }
    return Element;
}());
var Container = /** @class */ (function (_super) {
    __extends(Container, _super);
    function Container(type) {
        var _this = _super.call(this) || this;
        _this.type = type;
        return _this;
    }
    return Container;
}(Element));
var Body = /** @class */ (function (_super) {
    __extends(Body, _super);
    function Body() {
        return _super.call(this, 'body') || this;
    }
    return Body;
}(Container));
var Head = /** @class */ (function (_super) {
    __extends(Head, _super);
    function Head() {
        var _this = _super.call(this, 'head') || this;
        _this.meta = [];
        return _this;
    }
    return Head;
}(Container));
var HTML = /** @class */ (function (_super) {
    __extends(HTML, _super);
    function HTML() {
        return _super.call(this, 'html') || this;
    }
    return HTML;
}(Container));
var Template = /** @class */ (function () {
    function Template() {
        this["import"] = [];
    }
    Template.prototype.transverse = function (node, parent) {
        if (node.type === 'JSXElement') {
            return this.element(node, parent);
        }
        switch (node.type) {
            case 'ImportDeclaration': return this.declare_import(node);
            case 'ExportNamedDeclaration': return this.declare_export(node);
            case 'FunctionDeclaration': return this.declare_function(node, parent);
            case 'ExpressionStatement': return this.declare_expression(node, parent);
            case 'JSXExpressionContainer': return this.declare_expression(node, parent);
            case 'JSXText': return this.text(node, parent);
            default: return console.log("transverse:", node.type);
        }
    };
    Template.prototype.internal_transverse = function (node, parent) {
        if (node.type === 'JSXElement') {
            return this.internal_element(node, parent);
        }
        return this.transverse(node, parent);
    };
    /**
     * Template declaration functions.
     *
     */
    Template.prototype.declare_function = function (node, parent) {
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
    Template.prototype.element_html = function (node, parent) {
        if (parent) {
            throw new Error("Nesting html elements is not allowed");
        }
        if (parent == null) {
            if (this.html) {
                throw new Error("Duplicated html blocks related to the template is not allowed");
            }
            this.html = new HTML();
        }
        // TODO: Parse properties from element
        if (node.children) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                this.internal_transverse(children, this.html);
            }
        }
    };
    Template.prototype.element_head = function (node, parent) {
        if (!parent || parent.type !== 'html') {
            throw new Error("Nesting head elements are allowed only in html containers");
        }
        var html = parent;
        if (html.head) {
            throw new Error("Duplicated head element in html container is not allowed");
        }
        html.head = new Head();
        // TODO: Parse properties
        if (node.children) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                this.internal_transverse(children, html.head);
            }
        }
    };
    Template.prototype.element_body = function (node, parent) {
        if (!parent || parent.type !== 'html') {
            throw new Error("Nesting body elements are allowed only in html containers");
        }
        var html = parent;
        if (html.body) {
            throw new Error("Duplicated body element in html container is not allowed");
        }
        html.body = new Body();
        if (node.children) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var children = _a[_i];
                this.transverse(children, html.body);
            }
        }
    };
    Template.prototype.element_metadata = function (node, parent) {
    };
    Template.prototype.element_router = function (node, parent) {
    };
    Template.prototype.element_route = function (node, parent) {
    };
    Template.prototype.element_title = function (node, parent) {
        if (!parent || parent.type !== 'head') {
            throw new Error("Nesting body elements are allowed only in head containers");
        }
        var head = parent;
    };
    Template.prototype.element_base = function (node, parent) {
    };
    Template.prototype.element_link = function (node, parent) {
    };
    Template.prototype.element_meta = function (node, parent) {
        if (parent.type !== 'head') {
            throw new Error("Nesting meta elements are allowed only in head containers");
        }
        var head = parent;
        /**
         * There are few metatags that will require merging/overriding:
         * titles
         * name=author
         * name=description
         * name=keywords
         * name=generator
         * name=viewport
         * name=application-name
         * charset
         * http-equiv=content-security-policy
         * http-equiv=content-type
         * http-equiv=default-style
         * http-equiv=refresh
         */
        var element = new Element();
        for (var _i = 0, _a = node.openingElement.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            var name_3 = nameof(attr.name).name;
            var attribute = Attribute.fromNode(attr);
            attribute.name = name_3;
            element.attribute.push(attribute);
        }
        head.meta.push(element);
    };
    Template.prototype.element_script = function (node, parent) {
    };
    Template.prototype.element_noscript = function (node, parent) {
    };
    Template.prototype.element_template = function (node, parent) {
    };
    /**
     * General internal routers for specific elements handlers to transverse.
     *
     */
    Template.prototype.internal_element = function (node, parent) {
        var opening = node.openingElement;
        var name = nameof(opening).name;
        console.log('internal_element:', name);
        switch (name) {
            case 'title': return this.element_title(node, parent);
            case 'base': return this.element_base(node, parent);
            case 'link': return this.element_link(node, parent);
            case 'meta': return this.element_meta(node, parent);
            case 'script': return this.element_script(node, parent);
            case 'noscript': return this.element_noscript(node, parent);
            case 'template': return this.element_template(node, parent);
            case 'html': return this.element_html(node, parent);
            case 'body': return this.element_body(node, parent);
            case 'head': return this.element_head(node, parent);
            case 'metadata': return this.element_metadata(node, parent);
            case 'router': return this.element_router(node, parent);
            case 'route': return this.element_route(node, parent);
            default: return console.log("undefined internal_element: " + name);
        }
    };
    Template.prototype.element = function (node, parent) {
        var opening = node.openingElement;
        var _a = nameof(opening), name = _a.name, namespace = _a.namespace;
        if (namespace === 'app') {
            return this.internal_element(node, parent);
        }
        switch (name) {
            case 'html':
            case 'body':
            case 'head':
            case 'script':
            case 'template':
                return this.internal_element(node, parent);
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
                this.transverse(children, parent);
            }
        }
    };
    /**
     * Expression definitions.
     *
     */
    Template.prototype.logical_expression = function (expression, parent) {
    };
    Template.prototype.member_expression = function (expression, parent) {
    };
    Template.prototype.call_expression = function (expression, parent) {
    };
    Template.prototype.declare_expression = function (_a, parent) {
        var expression = _a.expression;
        switch (expression.type) {
            case 'JSXElement': return this.element(expression, parent);
            case 'LogicalExpression': return this.logical_expression(expression, parent);
            case 'MemberExpression': return this.member_expression(expression, parent);
            case 'CallExpression': return this.call_expression(expression, parent);
            default: return console.log("declare_expression: " + expression.type);
        }
    };
    /**
     * Generic functions for any type of node.
     *
     */
    Template.prototype.text = function (node, parent) {
    };
    Template.prototype.attribute = function (attribute) {
    };
    /**
     * Template API method definitions open for calling outside Template class.
     *
     */
    Template.prototype.parse = function (content, file) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a, node;
            return __generator(this, function (_b) {
                result = parser.parse(content, {
                    ecmaVersion: 'latest',
                    sourceType: 'module'
                });
                // TODO: Distinguished parsed tree of blocks.
                this.debug = {
                    bundle: fs.createWriteStream(file.swapExtension('.debug.js'), {
                        flags: 'w'
                    }),
                    html: fs.createWriteStream(file.swapExtension('.debug.html'), {
                        flags: 'w'
                    })
                };
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
                // TODO: Return statically generated template
                return [2 /*return*/, ''];
            });
        });
    };
    Template.prototype.merge = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Template;
}());
exports.Template = Template;
