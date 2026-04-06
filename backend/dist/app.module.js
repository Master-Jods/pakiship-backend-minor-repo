"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const customer_notifications_module_1 = require("./customer-notifications/customer-notifications.module");
const auth_module_1 = require("./auth/auth.module");
const customer_profile_module_1 = require("./customer-profile/customer-profile.module");
const parcel_drafts_module_1 = require("./parcel-drafts/parcel-drafts.module");
const supabase_module_1 = require("./supabase/supabase.module");
const customer_dashboard_module_1 = require("./customer-dashboard/customer-dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            customer_notifications_module_1.CustomerNotificationsModule,
            customer_profile_module_1.CustomerProfileModule,
            parcel_drafts_module_1.ParcelDraftsModule,
            customer_dashboard_module_1.CustomerDashboardModule,
        ],
    })
], AppModule);
