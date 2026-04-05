"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProfileModule = void 0;
const common_1 = require("@nestjs/common");
const customer_notifications_module_1 = require("../customer-notifications/customer-notifications.module");
const customer_profile_controller_1 = require("./customer-profile.controller");
const customer_profile_service_1 = require("./customer-profile.service");
let CustomerProfileModule = class CustomerProfileModule {
};
exports.CustomerProfileModule = CustomerProfileModule;
exports.CustomerProfileModule = CustomerProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_notifications_module_1.CustomerNotificationsModule],
        controllers: [customer_profile_controller_1.CustomerProfileController],
        providers: [customer_profile_service_1.CustomerProfileService],
    })
], CustomerProfileModule);
