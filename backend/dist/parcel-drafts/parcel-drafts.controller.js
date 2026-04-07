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
exports.ParcelDraftsController = void 0;
const common_1 = require("@nestjs/common");
const session_auth_guard_1 = require("../common/session/session-auth.guard");
const parcel_drafts_service_1 = require("./parcel-drafts.service");
function getSessionUser(request) {
    return request.user;
}
let ParcelDraftsController = class ParcelDraftsController {
    constructor(parcelDraftsService) {
        this.parcelDraftsService = parcelDraftsService;
    }
    estimateRoute(request, body) {
        return this.parcelDraftsService.estimateRoute(getSessionUser(request), body);
    }
    getAvailableHubs(request) {
        return this.parcelDraftsService.getAvailableHubs(getSessionUser(request));
    }
    saveStepOne(request, body) {
        return this.parcelDraftsService.saveRouteDetails(getSessionUser(request), body);
    }
    getTrackingDetails(request, trackingNumber) {
        return this.parcelDraftsService.getTrackingDetails(getSessionUser(request), trackingNumber);
    }
    getHistory(request) {
        return this.parcelDraftsService.getHistory(getSessionUser(request));
    }
    getHistoryDetails(request, trackingNumber) {
        return this.parcelDraftsService.getHistoryDetails(getSessionUser(request), trackingNumber);
    }
    getDraft(request, draftId, itemsLimit) {
        const parsedLimit = Number(itemsLimit ?? "");
        return this.parcelDraftsService.getDraftDetails(getSessionUser(request), draftId, Number.isFinite(parsedLimit) ? parsedLimit : undefined);
    }
    getDraftItems(request, draftId, limit, offset) {
        const parsedLimit = Number(limit ?? "");
        const parsedOffset = Number(offset ?? "");
        return this.parcelDraftsService.getDraftItemsPage(getSessionUser(request), draftId, Number.isFinite(parsedLimit) ? parsedLimit : undefined, Number.isFinite(parsedOffset) ? parsedOffset : undefined);
    }
    addDraftItems(request, draftId, body) {
        return this.parcelDraftsService.addDraftItems(getSessionUser(request), draftId, body);
    }
    updateDraftItem(request, draftId, itemId, body) {
        return this.parcelDraftsService.updateDraftItem(getSessionUser(request), draftId, itemId, body);
    }
    removeDraftItem(request, draftId, itemId) {
        return this.parcelDraftsService.removeDraftItem(getSessionUser(request), draftId, itemId);
    }
    selectService(request, draftId, body) {
        return this.parcelDraftsService.selectDraftService(getSessionUser(request), draftId, body);
    }
    completeBooking(request, draftId, body) {
        return this.parcelDraftsService.completeBooking(getSessionUser(request), draftId, body);
    }
};
exports.ParcelDraftsController = ParcelDraftsController;
__decorate([
    (0, common_1.Post)("estimate-route"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "estimateRoute", null);
__decorate([
    (0, common_1.Get)("hubs"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "getAvailableHubs", null);
__decorate([
    (0, common_1.Post)("step-1"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "saveStepOne", null);
__decorate([
    (0, common_1.Get)("track/:trackingNumber"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("trackingNumber")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "getTrackingDetails", null);
__decorate([
    (0, common_1.Get)("history"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)("history/:trackingNumber"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("trackingNumber")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "getHistoryDetails", null);
__decorate([
    (0, common_1.Get)(":draftId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Query)("itemsLimit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Get)(":draftId/items"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("offset")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "getDraftItems", null);
__decorate([
    (0, common_1.Post)(":draftId/items"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "addDraftItems", null);
__decorate([
    (0, common_1.Patch)(":draftId/items/:itemId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Param)("itemId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "updateDraftItem", null);
__decorate([
    (0, common_1.Delete)(":draftId/items/:itemId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "removeDraftItem", null);
__decorate([
    (0, common_1.Post)(":draftId/service"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "selectService", null);
__decorate([
    (0, common_1.Post)(":draftId/booking"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("draftId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ParcelDraftsController.prototype, "completeBooking", null);
exports.ParcelDraftsController = ParcelDraftsController = __decorate([
    (0, common_1.Controller)("parcel-drafts"),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __metadata("design:paramtypes", [parcel_drafts_service_1.ParcelDraftsService])
], ParcelDraftsController);
