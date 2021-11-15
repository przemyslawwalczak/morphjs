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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerRequests = exports.handleApiRequests = exports.handlePublicRequests = exports.Application = exports.Watcher = void 0;
const fs = __importStar(require("./fs"));
const path = __importStar(require("path"));
const LanguageRequestParser = __importStar(require("accept-language-parser"));
const locale_1 = require("./locale");
const controller_1 = require("./controller");
const view_1 = require("./view");
const controller_2 = require("./controller");
const exception_1 = require("./exception");
class Watcher {
    constructor(app) {
    }
}
exports.Watcher = Watcher;
class Application {
    constructor(server, option) {
        this.server = server;
        this.option = option;
        this.namespace = this.option.namespace || null;
        this.mode = this.option.mode || 'development';
        this.root = path.resolve('.');
        this.base = this.resolve(this.namespace || '.');
        this.locale = new locale_1.LocaleContainer(this);
        this.controller = new controller_1.ControllerContainer(this);
        this.view = new view_1.ViewContainer(this);
        this.watcher = new Watcher(this);
    }
    resolve(target, separator = path.sep) {
        const base = this.base || this.root;
        if (path.isAbsolute(base)) {
            return path.posix.join(base, '.' + path.posix.normalize('/' + target))
                .replace(/[\\\/]+/g, separator);
        }
        return path.posix.resolve(base, '.' + path.posix.normalize('/' + target))
            .replace(/[\\\/]+/g, separator);
    }
    hookLocaleDirectory(directory) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_b = (_a = this.option) === null || _a === void 0 ? void 0 : _a.locale) === null || _b === void 0 ? void 0 : _b.default)) {
                throw new exception_1.CONFIGURATION_REQUIRED('locale.default');
            }
            for (const descriptor of yield fs.readdirRecursive(directory)) {
                if (descriptor.ext !== '.yaml') {
                    continue;
                }
                const [type, ...slug] = descriptor.relative.split(path.sep);
                const container = this.locale.findOrCreate(type);
                const name = slug.filter(node => node.trim().length).join('/');
                container.document.set(name, yield fs.yaml(descriptor.absolute));
            }
        });
    }
    hookControllerDirectory(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const descriptor of yield fs.readdirRecursive(directory)) {
                if (descriptor.ext !== '.js') {
                    continue;
                }
            }
        });
    }
    hookViewDirectory(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const descriptor of yield fs.readdirRecursive(directory)) {
                if (descriptor.ext !== '.jsx') {
                    continue;
                }
            }
        });
    }
    compile() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static from(path, server) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield fs.exists(path))) {
                throw new exception_1.INVALID_FILE_PATH(path);
            }
            // TODO: Validate options against a schema, and attach a reload function if development mode is ON.
            return new Application(server, yield fs.yaml(path));
        });
    }
}
exports.Application = Application;
function handlePublicRequests(server, option, next) {
    console.log('hooking public directory requests');
    server.get('/', (request, response) => {
        console.log('public request');
        response.send({
            result: 'default public request'
        });
    });
    server.setNotFoundHandler(function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            reply.status(409).send('not found public error');
        });
    });
    server.setErrorHandler(function (error, request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.error(error);
            reply.status(409).send('custom public error');
        });
    });
    next();
}
exports.handlePublicRequests = handlePublicRequests;
function handleApiRequests(server, option, next) {
    console.log('hooking api requests');
    server.get('/', (request, response) => {
        console.log('api request');
        response.send({
            result: 'default api request'
        });
    });
    server.setNotFoundHandler(function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            reply.status(409).send('not found api error');
        });
    });
    server.setErrorHandler(function (error, request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.error(error);
            reply.status(409).send('custom api error');
        });
    });
    next();
}
exports.handleApiRequests = handleApiRequests;
function handleControllerRequests(server, option, next) {
    server.decorateReply('render', controller_2.render);
    server.addHook('onRequest', (request, response, done) => {
        const enabled = server.app.locale.enabled;
        const locale = request.params.locale;
        const remote_address = request.headers['x-forwarded-for'] || request.ip;
        const language = LanguageRequestParser.parse(request.headers['accept-language']);
        if ((!enabled && !locale) || locale !== server.app.locale.default) {
            // TODO: If locale is a valid locale, then replace it.
            return response.redirect(301, `/${server.app.locale.default}${request.url}`);
        }
        // TODO: Decorate request with locale we targetted for.
        console.log('locale requested:', locale);
        console.log('remote_address:', remote_address);
        console.log('accepts_languages:', language);
        done();
    });
    server.get('/', (request, response) => {
        response.render('page/landing');
    });
    server.setNotFoundHandler(function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            reply.status(409).send('not found error');
        });
    });
    server.setErrorHandler(function (error, request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.error(error);
            reply.status(409).send('custom error');
        });
    });
    next();
}
exports.handleControllerRequests = handleControllerRequests;
//# sourceMappingURL=application.js.map