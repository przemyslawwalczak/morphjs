"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locale = exports.Controller = exports.createEndpoint = void 0;
require("source-map-support/register");
const pino_1 = __importDefault(require("pino"));
const fastify_1 = require("fastify");
const application_1 = require("./application");
function createEndpoint(configurationAbsoluteFilePath, option = {}) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (option.logger == null) {
            option.logger = (0, pino_1.default)({ level: 'info' });
        }
        const server = (0, fastify_1.fastify)(option);
        const app = server.app = yield application_1.Application.from(configurationAbsoluteFilePath, server);
        const { locale } = app.option;
        yield app.hookLocaleDirectory(app.resolve((locale === null || locale === void 0 ? void 0 : locale.directory) || 'locale'));
        yield app.hookControllerDirectory(app.resolve('controller'));
        yield app.hookViewDirectory(app.resolve('view'));
        // TODO: Register plugins
        // TODO: Load controllers
        yield app.compile();
        yield server.register(application_1.handlePublicRequests, {
            prefix: '/public'
        });
        yield server.register(application_1.handleApiRequests, {
            prefix: '/api'
        });
        yield server.register(application_1.handleControllerRequests, {
            prefix: '/:locale'
        });
        yield server.listen(((_a = app.option.endpoint) === null || _a === void 0 ? void 0 : _a.port) || 80, ((_b = app.option.endpoint) === null || _b === void 0 ? void 0 : _b.host) || 'localhost');
    });
}
exports.createEndpoint = createEndpoint;
var controller_1 = require("./controller");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return controller_1.Controller; } });
exports.Locale = __importStar(require("./locale"));
//# sourceMappingURL=index.js.map