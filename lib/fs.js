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
var fs = require("fs");
var promise = require("fs/promises");
var path = require("path");
var yaml = require("js-yaml");
function exists(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promise.stat(path)
                        .then(function () { return true; })["catch"](function () { return false; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function readdir(directory, recursively, result, root) {
    if (recursively === void 0) { recursively = false; }
    if (result === void 0) { result = []; }
    if (root === void 0) { root = null; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, _loop_1, _i, _b, file;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = root == null;
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, exists(directory)];
                case 1:
                    _a = !(_c.sent());
                    _c.label = 2;
                case 2:
                    if (_a) {
                        return [2 /*return*/, []];
                    }
                    _loop_1 = function (file) {
                        var absolute, stat, relative, type, descriptor;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    absolute = path.join(directory, file);
                                    return [4 /*yield*/, promise.stat(absolute)];
                                case 1:
                                    stat = _d.sent();
                                    if (!stat.isDirectory()) return [3 /*break*/, 3];
                                    return [4 /*yield*/, readdir(absolute, recursively, result, root || directory)];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/, "continue"];
                                case 3:
                                    relative = absolute.replace(root || directory, '');
                                    type = path.parse(absolute);
                                    descriptor = {
                                        absolute: absolute,
                                        relative: relative,
                                        ext: type.ext,
                                        name: type.name,
                                        directory: relative.replace(type.base, ''),
                                        swapExtension: function (ext) {
                                            return path.join(root || directory, type.name + ext);
                                        }
                                    };
                                    result.push(descriptor);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0;
                    return [4 /*yield*/, promise.readdir(directory)];
                case 3:
                    _b = _c.sent();
                    _c.label = 4;
                case 4:
                    if (!(_i < _b.length)) return [3 /*break*/, 7];
                    file = _b[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, result];
            }
        });
    });
}
function readfile(file, encoding) {
    if (encoding === void 0) { encoding = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promise.readFile(file, { encoding: encoding })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function readyaml(file) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = yaml).load;
                    return [4 /*yield*/, readfile(file)];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            }
        });
    });
}
function readjson(file) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, readfile(file)];
                case 1: return [4 /*yield*/, (_c.sent()).toString()];
                case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            }
        });
    });
}
function readconfig(file) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, coerced, config;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exists(file)];
                case 1:
                    if (!(_b.sent())) {
                        throw new Error("Unreadable configuration file: " + file);
                    }
                    result = path.parse(file);
                    _a = result.ext;
                    switch (_a) {
                        case '.yaml': return [3 /*break*/, 2];
                        case '.json': return [3 /*break*/, 4];
                        case '.ts': return [3 /*break*/, 6];
                        case '.js': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 8];
                case 2: return [4 /*yield*/, readyaml(file)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4: return [4 /*yield*/, readjson(file)];
                case 5: return [2 /*return*/, _b.sent()];
                case 6:
                    {
                        coerced = path.format({
                            root: result.root,
                            dir: result.dir,
                            name: result.name,
                            ext: '.js',
                            base: result.name + ".js"
                        });
                        config = require(coerced)["default"];
                        return [2 /*return*/, config];
                    }
                    _b.label = 7;
                case 7: return [2 /*return*/, require(file)];
                case 8: throw new Error("Unsupported configuration extension: " + result.ext);
            }
        });
    });
}
function readstream(file) {
    return fs.createReadStream(file);
}
exports["default"] = {
    readdir: readdir,
    readfile: readfile,
    readstream: readstream,
    readyaml: readyaml,
    readconfig: readconfig,
    readjson: readjson,
    exists: exists
};
