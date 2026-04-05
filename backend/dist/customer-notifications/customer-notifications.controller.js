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
exports.CustomerNotificationsController = void 0;
const common_1 = require("@nestjs/common");
const session_auth_guard_1 = require("../common/session/session-auth.guard");
const customer_notifications_service_1 = require("./customer-notifications.service");
function getSessionUser(request) {
    return request.user;
}
let CustomerNotificationsController = class CustomerNotificationsController {
    constructor(customerNotificationsService) {
        this.customerNotificationsService = customerNotificationsService;
    }
    list(request) {
        return this.customerNotificationsService.listNotifications(getSessionUser(request));
    }
    markAllAsRead(request) {
        return this.customerNotificationsService.markAllAsRead(getSessionUser(request));
    }
    markAsRead(request, notificationId) {
        return this.customerNotificationsService.markAsRead(getSessionUser(request), notificationId);
    }
    clearAll(request) {
        return this.customerNotificationsService.clearAll(getSessionUser(request));
    }
};
exports.CustomerNotificationsController = CustomerNotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerNotificationsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)("read-all"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerNotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Patch)(":notificationId/read"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("notificationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CustomerNotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerNotificationsController.prototype, "clearAll", null);
exports.CustomerNotificationsController = CustomerNotificationsController = __decorate([
    (0, common_1.Controller)("customer/notifications"),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [customer_notifications_service_1.CustomerNotificationsService])
], CustomerNotificationsController);
