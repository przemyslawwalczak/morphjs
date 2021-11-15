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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToDefault = exports.willRequestRedirectToDefault = exports.Controller = exports.LocaleKeyRoute = exports.LocaleContainer = exports.Locale = void 0;
const controller_1 = require("./controller");
const LanguageRequestParser = __importStar(require("accept-language-parser"));
class Locale {
    constructor() {
        this.document = new Map();
    }
}
exports.Locale = Locale;
class LocaleContainer {
    constructor(app) {
        var _a;
        this.enabled = true;
        this.directory = new Map();
        this.default = ((_a = app.option.locale) === null || _a === void 0 ? void 0 : _a.default) || 'en';
    }
    findOrCreate(type) {
        const hasResult = this.directory.has(type);
        const result = this.directory.get(type) || new Locale();
        if (!hasResult) {
            const [language, region] = type.split('-');
            result.language = language;
            result.region = region;
            this.directory.set(type, result);
        }
        return result;
    }
    map(callback) {
        for (const locale of this.directory.values()) {
            callback(locale);
        }
    }
}
exports.LocaleContainer = LocaleContainer;
class LocaleKeyRoute {
    constructor(key, target) {
    }
}
exports.LocaleKeyRoute = LocaleKeyRoute;
function Controller(key = 'route', target) {
    return class LocaleKeyRouteController extends controller_1.AbstractController {
        constructor() {
            super(...arguments);
            this.route = new LocaleKeyRoute(key, target);
        }
    };
}
exports.Controller = Controller;
function willRequestRedirectToDefault(request) {
    const locale = request.params.locale;
    const remote_address = request.headers['x-forwarded-for'] || request.ip;
    const language = LanguageRequestParser.parse(request.headers['accept-language']);
    console.log('locale requested:', locale);
    console.log('remote_address:', remote_address);
    console.log('accepts_languages:', language);
    if (!language.length && !locale) {
        return true;
    }
    if (language.length && !locale) {
    }
    // if (locales[locale] == null)
    // {
    //    // TODO: Instead of default set language, set the language based on locale, otherwise default.
    //    return reply.redirect(301, `/${locales.default}${request.url}`)
    // }
    // if (request.url.indexOf('/', locale.length + 1) === -1)
    // {
    //    return reply.redirect(301, request.url + '/')
    // }
    return false;
}
exports.willRequestRedirectToDefault = willRequestRedirectToDefault;
function redirectToDefault(request, response) {
}
exports.redirectToDefault = redirectToDefault;
//# sourceMappingURL=locale.js.map