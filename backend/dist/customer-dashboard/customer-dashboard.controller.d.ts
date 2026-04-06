import type { Request } from "express";
import { CustomerDashboardService } from "./customer-dashboard.service";
export declare class CustomerDashboardController {
    private readonly customerDashboardService;
    constructor(customerDashboardService: CustomerDashboardService);
    getActiveDeliveries(request: Request, search?: string, status?: string): Promise<{
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
    getAnnouncements(request: Request): Promise<{
        announcements: {
            id: any;
            type: any;
            title: any;
            message: any;
            isPinned: boolean;
        }[];
    }>;
    getRecentReviews(request: Request, limit?: string): Promise<{
        reviews: {
            id: any;
            trackingNumber: any;
            rating: any;
            review: any;
            tags: any;
            createdAt: any;
        }[];
    }>;
    submitReview(request: Request, body: Record<string, unknown>): Promise<{
        review: {
            id: any;
            trackingNumber: any;
            rating: any;
            review: any;
            tags: any;
            createdAt: any;
        };
    }>;
    getPreferences(request: Request): Promise<{
        preferences: {
            emailNotifications: boolean;
            smsUpdates: boolean;
            autoExtend: boolean;
        };
    }>;
    updatePreferences(request: Request, body: Record<string, unknown>): Promise<{
        preferences: {
            autoExtend: boolean;
            smsUpdates: boolean;
            emailNotifications: boolean;
        };
    }>;
}
