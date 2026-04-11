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
exports.DriverBookingsController = void 0;
const common_1 = require("@nestjs/common");
const session_auth_guard_1 = require("../common/session/session-auth.guard");
const driver_bookings_service_1 = require("./driver-bookings.service");
function getSessionUser(request) {
    return request.user;
}
let DriverBookingsController = class DriverBookingsController {
    constructor(driverBookingsService) {
        this.driverBookingsService = driverBookingsService;
    }
    listBookingRequests(request, deliveryType, updatedSince) {
        return this.driverBookingsService.listBookingRequests(getSessionUser(request), deliveryType, updatedSince);
    }
    acceptBookingRequest(request, draftId) {
        return this.driverBookingsService.acceptBookingRequest(getSessionUser(request), draftId);
    }
};
exports.DriverBookingsController = DriverBookingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("deliveryType")),
    __param(2, (0, common_1.Query)("updatedSince")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DriverBookingsController.prototype, "listBookingRequests", null);
__decorate([
    (0, common_1.Patch)(":draftId/accept"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DriverBookingsController.prototype, "acceptBookingRequest", null);
exports.DriverBookingsController = DriverBookingsController = __decorate([
    (0, common_1.Controller)("driver/bookings"),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [driver_bookings_service_1.DriverBookingsService])
], DriverBookingsController);
