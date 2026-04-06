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
exports.CustomerDashboardController = void 0;
const common_1 = require("@nestjs/common");
const session_auth_guard_1 = require("../common/session/session-auth.guard");
const customer_dashboard_service_1 = require("./customer-dashboard.service");
function getSessionUser(request) {
    return request.user;
}
let CustomerDashboardController = class CustomerDashboardController {
    constructor(customerDashboardService) {
        this.customerDashboardService = customerDashboardService;
    }
    getActiveDeliveries(request, search, status) {
        return this.customerDashboardService.getActiveDeliveries(getSessionUser(request), {
            search,
            status,
        });
    }
    getAnnouncements(request) {
        return this.customerDashboardService.getAnnouncements(getSessionUser(request));
    }
    getRecentReviews(request, limit) {
        return this.customerDashboardService.getRecentReviews(getSessionUser(request), limit);
    }
    submitReview(request, body) {
        return this.customerDashboardService.submitReview(getSessionUser(request), {
            trackingNumber: String(body.trackingNumber ?? ""),
            rating: Number(body.rating ?? 0),
            review: body.review ? String(body.review) : undefined,
            tags: Array.isArray(body.tags) ? body.tags.map((value) => String(value)) : undefined,
        });
    }
    getPreferences(request) {
        return this.customerDashboardService.getPreferences(getSessionUser(request));
    }
    updatePreferences(request, body) {
        return this.customerDashboardService.updatePreferences(getSessionUser(request), {
            emailNotifications: typeof body.emailNotifications === "boolean" ? body.emailNotifications : undefined,
            smsUpdates: typeof body.smsUpdates === "boolean" ? body.smsUpdates : undefined,
            autoExtend: typeof body.autoExtend === "boolean" ? body.autoExtend : undefined,
        });
    }
};
exports.CustomerDashboardController = CustomerDashboardController;
__decorate([
    (0, common_1.Get)("dashboard/active-deliveries"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("search")),
    __param(2, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CustomerDashboardController.prototype, "getActiveDeliveries", null);
__decorate([
    (0, common_1.Get)("dashboard/announcements"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerDashboardController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Get)("reviews"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CustomerDashboardController.prototype, "getRecentReviews", null);
__decorate([
    (0, common_1.Post)("reviews"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerDashboardController.prototype, "submitReview", null);
__decorate([
    (0, common_1.Get)("settings/preferences"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerDashboardController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Patch)("settings/preferences"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerDashboardController.prototype, "updatePreferences", null);
exports.CustomerDashboardController = CustomerDashboardController = __decorate([
    (0, common_1.Controller)("customer"),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [customer_dashboard_service_1.CustomerDashboardService])
], CustomerDashboardController);
