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
exports.CreateEndpoint = exports.Controller = void 0;
var fastify_1 = require("fastify");
var path = require("path");
var fs_1 = require("../lib/fs");
var config_1 = require("../lib/config");
var renderer_1 = require("./renderer");
/**
 * Controller abstract class for defining controllers on the endpoint.
 */
var Controller = /** @class */ (function () {
    function Controller() {
    }
    return Controller;
}());
exports.Controller = Controller;
/**
 * Creation of Fastify instance based on a configuration file.
 * @param configuration_absolute_path
 * @returns Configured Fastify instance
 */
function CreateEndpoint(configuration_absolute_file_path) {
    return __awaiter(this, void 0, void 0, function () {
        function render(name, data) {
            return __awaiter(this, void 0, void 0, function () {
                var start, locale, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            start = process.hrtime.bigint();
                            this.status(200);
                            this.type('text/html');
                            locale = {
                                language: 'pl',
                                region: 'pl',
                                description: 'Test description website'
                            };
                            return [4 /*yield*/, renderer.render(name, locale, data)];
                        case 1:
                            result = _a.sent();
                            console.log(this.request.method.toUpperCase() + ": " + this.request.url + ": Rendered in: " + parseInt((process.hrtime.bigint() - start).toString()) / 1000000 + " ms");
                            return [2 /*return*/, result];
                    }
                });
            });
        }
        var config, endpoint, view, renderer, controllers, _i, _a, path_1, module_1, _loop_1, _b, _c, value;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, config_1["default"].app(configuration_absolute_file_path)];
                case 1:
                    config = _d.sent();
                    endpoint = fastify_1["default"](config.engine);
                    view = path.join(process.cwd(), 'view');
                    renderer = new renderer_1.Renderer(config);
                    return [4 /*yield*/, renderer.parse(view, config)];
                case 2:
                    _d.sent();
                    endpoint.addHook('preHandler', function (request, response, callback) {
                        var coerced = response;
                        coerced.render = render.bind(response);
                        callback();
                    });
                    // TODO: /public/engine.js option should be exposed in config file; enabled by default.
                    endpoint.route({
                        method: 'GET',
                        url: renderer.engine.public,
                        handler: function (request, response) {
                            var stream = fs_1["default"].readstream(path.join(__dirname, '../public/engine.js'));
                            response.header('content-type', 'application/javascript');
                            response.send(stream);
                        }
                    });
                    endpoint.route({
                        method: 'GET',
                        url: '/public/*',
                        handler: function (request, response) {
                            console.log('requesting public:', request.url);
                            response.send({
                                requested: request.url
                            });
                        }
                    });
                    controllers = path.join(process.cwd(), 'controller');
                    _i = 0;
                    return [4 /*yield*/, fs_1["default"].readdir(controllers, true)];
                case 3:
                    _a = _d.sent();
                    _d.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    path_1 = _a[_i];
                    /**
                     * Skipping on controllers that are not javascript files.
                     */
                    if (path_1.ext !== '.js')
                        return [3 /*break*/, 5];
                    module_1 = require(path_1.absolute);
                    /**
                     * Insanity checks if the file was properly exported.
                     * NOTE: Nodejs by default might return an empty module if the file was/is empty.
                     */
                    if (module_1 == null)
                        return [3 /*break*/, 5];
                    _loop_1 = function (value) {
                        if (Object.getPrototypeOf(value) === Controller) {
                            /**
                             * Construction of a controller extending abstract base Controller class.
                             */
                            var controller_1 = new value();
                            console.log('registered controller:', controller_1.url, controller_1.method);
                            endpoint.route({
                                url: controller_1.url,
                                method: controller_1.method,
                                handler: function (request, response) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, controller_1.handler(request, response)];
                                            case 1: return [2 /*return*/, _a.sent()];
                                        }
                                    });
                                }); }
                            });
                        }
                    };
                    /**
                     * Searching for valid prototypes of a controller to register on the server endpoint.
                     */
                    for (_b = 0, _c = Object.values(module_1); _b < _c.length; _b++) {
                        value = _c[_b];
                        _loop_1(value);
                    }
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 4];
                case 6: return [4 /*yield*/, endpoint.listen(config.endpoint.port, config.endpoint.host)
                        .then(function (address) {
                        // TODO: Properly logged instance based on configuration file.
                        console.log(config.app.name + " :: Listening: " + address);
                        return endpoint;
                    })];
                case 7: 
                /**
                 * Returning Promise resolution on endpoint listen to configured endpoint port and host.
                 */
                return [2 /*return*/, _d.sent()];
            }
        });
    });
}
exports.CreateEndpoint = CreateEndpoint;
