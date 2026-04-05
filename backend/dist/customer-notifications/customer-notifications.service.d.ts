import type { SessionPayload } from "../common/session/session.types";
import { SupabaseService } from "../supabase/supabase.service";
type NotificationType = "delivery" | "system" | "promo";
export declare class CustomerNotificationsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private ensureCustomer;
    createNotification(userId: string, type: NotificationType, title: string, message: string): Promise<void>;
    listNotifications(session: SessionPayload): Promise<{
        notifications: {
            id: any;
            type: NotificationType;
            title: any;
            message: any;
            time: string;
            isRead: any;
            createdAt: any;
        }[];
    }>;
    markAsRead(session: SessionPayload, notificationId: string): Promise<{
        notificationId: string;
    }>;
    markAllAsRead(session: SessionPayload): Promise<{
        success: boolean;
    }>;
    clearAll(session: SessionPayload): Promise<{
        success: boolean;
    }>;
}
export {};
