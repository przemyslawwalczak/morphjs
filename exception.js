"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIGURATION_REQUIRED = exports.INVALID_FILE_PATH = void 0;
const util_1 = require("util");
function createException(type, message) {
    return class Exception extends Error {
        constructor(...args) {
            super(`${type}: ${(0, util_1.format)(message, ...args)}`);
            this.type = type;
        }
    };
}
exports.INVALID_FILE_PATH = createException('INVALID_FILE_PATH', '%s');
exports.CONFIGURATION_REQUIRED = createException('CONFIGURATION_REQUIRED', '%s');
//# sourceMappingURL=exception.js.map