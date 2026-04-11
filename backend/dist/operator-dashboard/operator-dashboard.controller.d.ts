import type { Request } from "express";
import { OperatorDashboardService } from "./operator-dashboard.service";
export declare class OperatorDashboardController {
    private readonly operatorDashboardService;
    constructor(operatorDashboardService: OperatorDashboardService);
    getDashboard(request: Request): Promise<{
        kpis: {
            incomingToday: number;
            currentlyStored: number;
            pickedUpToday: number;
            customersServed: number;
        };
        earnings: {
            totalEarned: number;
            weeklyIncrease: number;
            incentives: number;
            bonusesEarned: number;
        };
        meta: {
            currency: string;
            timeframe: string;
            derivedFrom: string;
        };
    }>;
    getRelayBookings(request: Request): Promise<{
        bookings: {
            draftId: string;
            trackingNumber: string;
            pickupAddress: string;
            deliveryAddress: string;
            receiverName: string;
            status: string;
            serviceId: string;
            deliveryMode: string;
            isBulk: boolean;
            totalParcels: number;
            currentLocation: string;
            progressLabel: string;
            progressPercentage: number;
            dropOffPoint: {
                id: string;
                name: string;
                address: string;
            };
            createdAt: string;
        }[];
        meta: {
            hubId: string;
            matchedBy: string;
        };
    }>;
    updateRelayBookingStatus(request: Request, draftId: string, body: Record<string, unknown>): Promise<{
        draftId: string;
        trackingNumber: any;
        currentLocation: any;
        progressLabel: any;
        progressPercentage: number;
    }>;
}
