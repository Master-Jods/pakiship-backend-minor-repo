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
exports.CustomerDashboardService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const customer_notifications_service_1 = require("../customer-notifications/customer-notifications.service");
function ensureCustomer(session) {
    if (session.role !== "customer") {
        throw new common_1.ForbiddenException("Only customers can access this resource.");
    }
}
function asString(value) {
    return String(value ?? "").trim();
}
function parseBoolean(value, fallback = false) {
    if (typeof value === "boolean")
        return value;
    return fallback;
}
function parsePreferences(raw) {
    const source = (raw ?? {});
    return {
        emailNotifications: parseBoolean(source.emailNotifications),
        smsUpdates: parseBoolean(source.smsUpdates),
        autoExtend: parseBoolean(source.autoExtend),
    };
}
function formatRelativeTime(value) {
    if (!value)
        return "Just now";
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp))
        return "Just now";
    const diffMs = Date.now() - timestamp;
    const minute = 60_000;
    const hour = 60 * minute;
    if (diffMs < hour) {
        const mins = Math.max(1, Math.floor(diffMs / minute));
        return `${mins} min${mins === 1 ? "" : "s"} ago`;
    }
    const hours = Math.max(1, Math.floor(diffMs / hour));
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}
function normalizeTags(input) {
    const tags = Array.isArray(input) ? input : [];
    return tags
        .map((tag) => asString(tag))
        .filter((tag) => tag.length > 0)
        .slice(0, 10);
}
let CustomerDashboardService = class CustomerDashboardService {
    constructor(supabaseService, customerNotificationsService) {
        this.supabaseService = supabaseService;
        this.customerNotificationsService = customerNotificationsService;
    }
    async getActiveDeliveries(session, query) {
        ensureCustomer(session);
        const search = asString(query.search).toLowerCase();
        const statusFilter = asString(query.status).toLowerCase();
        let data = null;
        try {
            const admin = this.supabaseService.createAdminClient();
            const result = await admin
                .from("parcel_drafts")
                .select("id, tracking_number, pickup_address, delivery_address, status, updated_at")
                .eq("user_id", session.userId)
                .eq("status", "submitted")
                .order("updated_at", { ascending: false })
                .limit(100);
            if (result.error) {
                console.error("[customer-dashboard] active deliveries query failed:", result.error.message);
            }
            else {
                data = result.data;
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("[customer-dashboard] active deliveries failed:", message);
        }
        const deliveries = (data ?? []).map((item) => ({
            id: item.tracking_number || item.id,
            trackingNumber: item.tracking_number || item.id,
            from: item.pickup_address || "Unknown origin",
            to: item.delivery_address || "Unknown destination",
            status: "In Transit",
            rawStatus: item.status,
            updatedAt: item.updated_at,
            timeLabel: formatRelativeTime(item.updated_at),
        }));
        const filtered = deliveries.filter((item) => {
            const normalizedStatus = item.status.toLowerCase().replace(/\s+/g, "");
            const matchesStatus = !statusFilter || statusFilter === "all" || normalizedStatus === statusFilter;
            const haystack = `${item.trackingNumber} ${item.from} ${item.to}`.toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            return matchesStatus && matchesSearch;
        });
        return {
            deliveries: filtered,
            summary: {
                totalActive: filtered.length,
                inTransit: filtered.length,
                outForDelivery: 0,
            },
        };
    }
    async getAnnouncements(session) {
        ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const nowTs = Date.now();
        const { data, error } = await admin
            .from("customer_announcements")
            .select("id, type, title, message, is_pinned, starts_at, ends_at, created_at")
            .eq("is_active", true)
            .order("is_pinned", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(10);
        if (error) {
            return {
                announcements: [
                    {
                        id: "maint-001",
                        type: "system",
                        title: "Scheduled Maintenance",
                        message: "System will be offline on March 15, 2:00 AM - 4:00 AM PHT.",
                        isPinned: true,
                    },
                ],
            };
        }
        return {
            announcements: (data ?? [])
                .filter((item) => {
                const startsAt = item.starts_at ? new Date(item.starts_at).getTime() : null;
                const endsAt = item.ends_at ? new Date(item.ends_at).getTime() : null;
                const startsOk = startsAt === null || (!Number.isNaN(startsAt) && startsAt <= nowTs);
                const endsOk = endsAt === null || (!Number.isNaN(endsAt) && endsAt >= nowTs);
                return startsOk && endsOk;
            })
                .map((item) => ({
                id: item.id,
                type: item.type,
                title: item.title,
                message: item.message,
                isPinned: Boolean(item.is_pinned),
            })),
        };
    }
    async submitReview(session, input) {
        ensureCustomer(session);
        const trackingNumber = asString(input.trackingNumber);
        const rating = Number(input.rating);
        const review = asString(input.review);
        const tags = normalizeTags(input.tags);
        if (!trackingNumber) {
            throw new common_1.BadRequestException("Tracking number is required.");
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new common_1.BadRequestException("Rating must be between 1 and 5.");
        }
        if (review.length > 500) {
            throw new common_1.BadRequestException("Review must be 500 characters or less.");
        }
        const admin = this.supabaseService.createAdminClient();
        const ownedBooking = await admin
            .from("parcel_drafts")
            .select("id")
            .eq("user_id", session.userId)
            .eq("tracking_number", trackingNumber)
            .eq("status", "submitted")
            .maybeSingle();
        if (ownedBooking.error || !ownedBooking.data) {
            throw new common_1.BadRequestException("Tracking number not found in your completed bookings.");
        }
        const insertResult = await admin
            .from("customer_reviews")
            .insert({
            user_id: session.userId,
            tracking_number: trackingNumber,
            rating,
            review_text: review || null,
            tags,
        })
            .select("id, tracking_number, rating, review_text, tags, created_at")
            .single();
        if (insertResult.error || !insertResult.data) {
            throw new common_1.InternalServerErrorException("Unable to submit your review right now.");
        }
        await admin.from("customer_activity_logs").insert({
            user_id: session.userId,
            activity_type: "review",
            title: "Review submitted",
            description: `You submitted feedback for ${trackingNumber}.`,
        });
        await this.customerNotificationsService.createNotification(session.userId, "system", "Thanks for your feedback", `Your review for ${trackingNumber} has been saved.`);
        return {
            review: {
                id: insertResult.data.id,
                trackingNumber: insertResult.data.tracking_number,
                rating: insertResult.data.rating,
                review: insertResult.data.review_text,
                tags: insertResult.data.tags ?? [],
                createdAt: insertResult.data.created_at,
            },
        };
    }
    async getRecentReviews(session, limitInput) {
        ensureCustomer(session);
        const limit = Math.min(Math.max(Number(limitInput) || 5, 1), 20);
        const admin = this.supabaseService.createAdminClient();
        const result = await admin
            .from("customer_reviews")
            .select("id, tracking_number, rating, review_text, tags, created_at")
            .eq("user_id", session.userId)
            .order("created_at", { ascending: false })
            .limit(limit);
        if (result.error) {
            return { reviews: [] };
        }
        return {
            reviews: (result.data ?? []).map((item) => ({
                id: item.id,
                trackingNumber: item.tracking_number,
                rating: item.rating,
                review: item.review_text,
                tags: item.tags ?? [],
                createdAt: item.created_at,
            })),
        };
    }
    async getPreferences(session) {
        ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const authUser = await admin.auth.admin.getUserById(session.userId);
        const metadata = authUser.data.user?.user_metadata ?? {};
        return {
            preferences: parsePreferences(metadata.preferences),
        };
    }
    async updatePreferences(session, patch) {
        ensureCustomer(session);
        const admin = this.supabaseService.createAdminClient();
        const authUser = await admin.auth.admin.getUserById(session.userId);
        const metadata = authUser.data.user?.user_metadata ?? {};
        const current = parsePreferences(metadata.preferences);
        const preferences = {
            ...current,
            ...(typeof patch.emailNotifications === "boolean"
                ? { emailNotifications: patch.emailNotifications }
                : {}),
            ...(typeof patch.smsUpdates === "boolean" ? { smsUpdates: patch.smsUpdates } : {}),
            ...(typeof patch.autoExtend === "boolean" ? { autoExtend: patch.autoExtend } : {}),
        };
        const updateResult = await admin.auth.admin.updateUserById(session.userId, {
            user_metadata: {
                ...metadata,
                preferences,
            },
        });
        if (updateResult.error) {
            throw new common_1.InternalServerErrorException("Unable to save preferences right now.");
        }
        return { preferences };
    }
};
exports.CustomerDashboardService = CustomerDashboardService;
exports.CustomerDashboardService = CustomerDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        customer_notifications_service_1.CustomerNotificationsService])
], CustomerDashboardService);
