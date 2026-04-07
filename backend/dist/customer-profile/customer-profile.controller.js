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
exports.CustomerProfileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const session_auth_guard_1 = require("../common/session/session-auth.guard");
const customer_profile_service_1 = require("./customer-profile.service");
function getSessionUser(request) {
    return request.user;
}
let CustomerProfileController = class CustomerProfileController {
    constructor(customerProfileService) {
        this.customerProfileService = customerProfileService;
    }
    getProfile(request) {
        return this.customerProfileService.getCustomerProfile(getSessionUser(request));
    }
    getSavedRecipients(request) {
        return this.customerProfileService.getSavedRecipients(getSessionUser(request));
    }
    updateProfile(request, body) {
        return this.customerProfileService.updateCustomerProfile(getSessionUser(request), {
            fullName: body.fullName ? String(body.fullName) : undefined,
            email: body.email ? String(body.email) : undefined,
            phone: body.phone ? String(body.phone) : undefined,
            address: body.address ? String(body.address) : undefined,
            dob: body.dob !== undefined ? String(body.dob ?? "") : undefined,
            preferences: typeof body.preferences === "object" && body.preferences
                ? body.preferences
                : undefined,
        });
    }
    uploadAvatar(request, file) {
        return this.customerProfileService.uploadProfilePicture(getSessionUser(request), file);
    }
    uploadDiscountId(request, file) {
        return this.customerProfileService.uploadDiscountId(getSessionUser(request), file);
    }
    changePassword(request, body) {
        return this.customerProfileService.changePassword(getSessionUser(request), String(body.currentPassword ?? ""), String(body.newPassword ?? ""));
    }
    quickSaveRecipient(request, body) {
        return this.customerProfileService.quickSaveRecipient(getSessionUser(request), {
            name: String(body.name ?? ""),
            phone: String(body.phone ?? ""),
        });
    }
    setupTwoFactor(request) {
        return this.customerProfileService.createTwoFactorSetup(getSessionUser(request));
    }
    enableTwoFactor(request, body) {
        return this.customerProfileService.enableTwoFactor(getSessionUser(request), String(body.code ?? ""));
    }
    disableTwoFactor(request, body) {
        return this.customerProfileService.disableTwoFactor(getSessionUser(request), String(body.code ?? ""));
    }
};
exports.CustomerProfileController = CustomerProfileController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)("recipients"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "getSavedRecipients", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)("upload-avatar"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)("upload-discount-id"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "uploadDiscountId", null);
__decorate([
    (0, common_1.Post)("change-password"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)("recipients"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "quickSaveRecipient", null);
__decorate([
    (0, common_1.Post)("two-factor/setup"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "setupTwoFactor", null);
__decorate([
    (0, common_1.Post)("two-factor/enable"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "enableTwoFactor", null);
__decorate([
    (0, common_1.Post)("two-factor/disable"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerProfileController.prototype, "disableTwoFactor", null);
exports.CustomerProfileController = CustomerProfileController = __decorate([
    (0, common_1.Controller)("customer/profile"),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [customer_profile_service_1.CustomerProfileService])
], CustomerProfileController);
