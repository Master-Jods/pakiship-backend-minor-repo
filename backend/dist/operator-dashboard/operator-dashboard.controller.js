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
exports.OperatorDashboardController = void 0;
const common_1 = require("@nestjs/common");
const session_auth_guard_1 = require("../common/session/session-auth.guard");
const operator_dashboard_service_1 = require("./operator-dashboard.service");
function getSessionUser(request) {
    return request.user;
}
let OperatorDashboardController = class OperatorDashboardController {
    constructor(operatorDashboardService) {
        this.operatorDashboardService = operatorDashboardService;
    }
    getDashboard(request) {
        return this.operatorDashboardService.getDashboard(getSessionUser(request));
    }
    getRelayBookings(request) {
        return this.operatorDashboardService.getRelayBookings(getSessionUser(request));
    }
    updateRelayBookingStatus(request, draftId, body) {
        return this.operatorDashboardService.updateRelayBookingStatus(getSessionUser(request), draftId, {
            currentLocation: body.currentLocation,
            progressLabel: body.progressLabel,
            progressPercentage: body.progressPercentage,
        });
    }
};
exports.OperatorDashboardController = OperatorDashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OperatorDashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)("relay-bookings"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OperatorDashboardController.prototype, "getRelayBookings", null);
__decorate([
    (0, common_1.Patch)("relay-bookings/:draftId/status"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OperatorDashboardController.prototype, "updateRelayBookingStatus", null);
exports.OperatorDashboardController = OperatorDashboardController = __decorate([
    (0, common_1.Controller)("operator/dashboard"),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [operator_dashboard_service_1.OperatorDashboardService])
], OperatorDashboardController);
