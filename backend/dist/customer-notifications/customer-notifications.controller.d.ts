import type { Request } from "express";
import { CustomerNotificationsService } from "./customer-notifications.service";
export declare class CustomerNotificationsController {
    private readonly customerNotificationsService;
    constructor(customerNotificationsService: CustomerNotificationsService);
    list(request: Request): Promise<{
        notifications: {
            id: any;
            type: "delivery" | "system" | "promo";
            title: any;
            message: any;
            time: string;
            isRead: any;
            createdAt: any;
        }[];
    }>;
    markAllAsRead(request: Request): Promise<{
        success: boolean;
    }>;
    markAsRead(request: Request, notificationId: string): Promise<{
        notificationId: string;
    }>;
    clearAll(request: Request): Promise<{
        success: boolean;
    }>;
}
