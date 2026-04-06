import type { SessionPayload } from "../common/session/session.types";
import { SupabaseService } from "../supabase/supabase.service";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
type PreferencePatch = {
    emailNotifications?: boolean;
    smsUpdates?: boolean;
    autoExtend?: boolean;
};
type ReviewInput = {
    trackingNumber: string;
    rating: number;
    review?: string;
    tags?: string[];
};
export declare class CustomerDashboardService {
    private readonly supabaseService;
    private readonly customerNotificationsService;
    constructor(supabaseService: SupabaseService, customerNotificationsService: CustomerNotificationsService);
    getActiveDeliveries(session: SessionPayload, query: {
        search?: unknown;
        status?: unknown;
    }): Promise<{
        deliveries: {
            id: string;
            trackingNumber: string;
            from: string;
            to: string;
            status: string;
            rawStatus: string;
            updatedAt: string;
            timeLabel: string;
        }[];
        summary: {
            totalActive: number;
            inTransit: number;
            outForDelivery: number;
        };
    }>;
    getAnnouncements(session: SessionPayload): Promise<{
        announcements: {
            id: any;
            type: any;
            title: any;
            message: any;
            isPinned: boolean;
        }[];
    }>;
    submitReview(session: SessionPayload, input: ReviewInput): Promise<{
        review: {
            id: any;
            trackingNumber: any;
            rating: any;
            review: any;
            tags: any;
            createdAt: any;
        };
    }>;
    getRecentReviews(session: SessionPayload, limitInput?: unknown): Promise<{
        reviews: {
            id: any;
            trackingNumber: any;
            rating: any;
            review: any;
            tags: any;
            createdAt: any;
        }[];
    }>;
    getPreferences(session: SessionPayload): Promise<{
        preferences: {
            emailNotifications: boolean;
            smsUpdates: boolean;
            autoExtend: boolean;
        };
    }>;
    updatePreferences(session: SessionPayload, patch: PreferencePatch): Promise<{
        preferences: {
            autoExtend: boolean;
            smsUpdates: boolean;
            emailNotifications: boolean;
        };
    }>;
}
export {};
