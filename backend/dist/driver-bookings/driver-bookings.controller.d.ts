import type { Request } from "express";
import { DriverBookingsService } from "./driver-bookings.service";
export declare class DriverBookingsController {
    private readonly driverBookingsService;
    constructor(driverBookingsService: DriverBookingsService);
    listBookingRequests(request: Request, deliveryType?: string, updatedSince?: string): Promise<{
        bookings: {
            draftId: string;
            trackingNumber: string;
            pickupAddress: string;
            deliveryAddress: string;
            senderName: string;
            receiverName: string;
            status: string;
            serviceId: string;
            deliveryType: string;
            isBulk: boolean;
            totalParcels: number;
            currentLocation: string;
            progressLabel: string;
            progressPercentage: number;
            assignedDriverId: string;
            assignedDriverName: string;
            dropOffPoint: {
                id: string;
                name: string;
                address: string;
            };
            distance: string;
            duration: string;
            updatedAt: string;
            createdAt: string;
        }[];
        meta: {
            deliveryType: string;
            updatedSince: string;
            realtimeStrategy: string;
        };
    }>;
    acceptBookingRequest(request: Request, draftId: string): Promise<{
        draftId: string;
        trackingNumber: any;
        assignedDriver: {
            id: string;
            fullName: string;
        };
        progressLabel: any;
    }>;
}
