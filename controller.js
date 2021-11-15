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
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.Controller = exports.AbstractController = exports.ControllerContainer = void 0;
class ControllerContainer {
    constructor(app) {
    }
}
exports.ControllerContainer = ControllerContainer;
class AbstractController {
}
exports.AbstractController = AbstractController;
function Controller(route) {
    return class RouteController extends AbstractController {
        constructor() {
            super(...arguments);
            this.route = route;
        }
    };
}
exports.Controller = Controller;
function render(template, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = this.request;
        this.send(`rendering function: id: ${request.id}, ${request.method}: ${request.url}`);
    });
}
exports.render = render;
//# sourceMappingURL=controller.js.map