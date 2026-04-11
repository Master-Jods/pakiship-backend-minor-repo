"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverBookingsModule = void 0;
const common_1 = require("@nestjs/common");
const customer_notifications_module_1 = require("../customer-notifications/customer-notifications.module");
const parcel_drafts_repository_1 = require("../parcel-drafts/parcel-drafts.repository");
const driver_bookings_controller_1 = require("./driver-bookings.controller");
const driver_bookings_service_1 = require("./driver-bookings.service");
let DriverBookingsModule = class DriverBookingsModule {
};
exports.DriverBookingsModule = DriverBookingsModule;
exports.DriverBookingsModule = DriverBookingsModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_notifications_module_1.CustomerNotificationsModule],
        controllers: [driver_bookings_controller_1.DriverBookingsController],
        providers: [driver_bookings_service_1.DriverBookingsService, parcel_drafts_repository_1.ParcelDraftsRepository],
    })
], DriverBookingsModule);
