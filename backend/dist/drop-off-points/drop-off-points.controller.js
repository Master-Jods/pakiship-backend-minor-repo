"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropOffPointsController = void 0;
const common_1 = require("@nestjs/common");
const drop_off_points_service_1 = require("./drop-off-points.service");
let DropOffPointsController = class DropOffPointsController {
    constructor(dropOffPointsService) {
        this.dropOffPointsService = dropOffPointsService;
    }
    listNearby(query) {
        return this.dropOffPointsService.listNearby(query);
    }
};
exports.DropOffPointsController = DropOffPointsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("query")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DropOffPointsController.prototype, "listNearby", null);
exports.DropOffPointsController = DropOffPointsController = __decorate([
    (0, common_1.Controller)("drop-off-points"),
    __metadata("design:paramtypes", [drop_off_points_service_1.DropOffPointsService])
], DropOffPointsController);
