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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
function formatRelativeTime(value) {
    if (!value)
        return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "Just now";
    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diffMs < hour) {
        const minutes = Math.max(1, Math.floor(diffMs / minute));
        return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }
    if (diffMs < day) {
        const hours = Math.max(1, Math.floor(diffMs / hour));
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days} day${days === 1 ? "" : "s"} ago`;
}
let CustomerNotificationsService = class CustomerNotificationsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    ensureCustomer(session) {
        if (session.role !== "customer") {
            throw new common_1.ForbiddenException("Only customers can access notifications.");
        }
    }
    async createNotification(userId, type, title, message) {
        const admin = this.supabaseService.createAdminClient();
        const { error } = await admin.from("customer_notifications").insert({
            user_id: userId,
            type,
            title,
            message,
            is_read: false,
        });
        if (error) {
            throw new common_1.InternalServerErrorException("Unable to create customer notification.");
        }
    }
    async listNotifications(session) {
        this.ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const { data, error } = await admin
            .from("customer_notifications")
            .select("id, type, title, message, is_read, created_at")
            .eq("user_id", session.userId)
            .order("created_at", { ascending: false })
            .limit(20);
        if (error) {
            throw new common_1.InternalServerErrorException("Unable to load notifications.");
        }
        return {
            notifications: (data ?? []).map((item) => ({
                id: item.id,
                type: item.type,
                title: item.title,
                message: item.message,
                time: formatRelativeTime(item.created_at),
                isRead: item.is_read,
                createdAt: item.created_at,
            })),
        };
    }
    async markAsRead(session, notificationId) {
        this.ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const { error } = await admin
            .from("customer_notifications")
            .update({ is_read: true })
            .eq("id", notificationId)
            .eq("user_id", session.userId);
        if (error) {
            throw new common_1.InternalServerErrorException("Unable to update notification.");
        }
        return { notificationId };
    }
    async markAllAsRead(session) {
        this.ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const { error } = await admin
            .from("customer_notifications")
            .update({ is_read: true })
            .eq("user_id", session.userId)
            .eq("is_read", false);
        if (error) {
            throw new common_1.InternalServerErrorException("Unable to update notifications.");
        }
        return { success: true };
    }
    async clearAll(session) {
        this.ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const { error } = await admin
            .from("customer_notifications")
            .delete()
            .eq("user_id", session.userId);
        if (error) {
            throw new common_1.InternalServerErrorException("Unable to clear notifications.");
        }
        return { success: true };
    }
};
exports.CustomerNotificationsService = CustomerNotificationsService;
exports.CustomerNotificationsService = CustomerNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CustomerNotificationsService);
