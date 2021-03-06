#!/usr/bin/env node
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
const yargs_1 = __importDefault(require("yargs"));
const index_1 = require("../index");
const path = __importStar(require("path"));
const command = {
    start: {
        parse(yargs) {
            return __awaiter(this, void 0, void 0, function* () {
                return yargs.positional('$name', {
                    type: 'string',
                    describe: 'app encapsulation file',
                    default: 'app.yaml | app.js'
                });
            });
        },
        handle(argv) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, index_1.createEndpoint)(path.join(process.cwd(), argv.$name))
                    .catch(e => console.error('Shell Error:', e));
            });
        }
    }
};
(0, yargs_1.default)(process.argv.slice(2))
    .scriptName('morph')
    .command('start <$name>', 'start application', command.start.parse, command.start.handle)
    .command('list', 'list currently running applications', command.start.parse, command.start.handle)
    .command('stop <$name>', 'stop application', command.start.parse, command.start.handle)
    .command('restart <$name>', 'restart application', command.start.parse, command.start.handle)
    .command('remove <$name>', 'remove application from deamon', command.start.parse, command.start.handle)
    .demandCommand()
    .argv;
//# sourceMappingURL=shell.js.map