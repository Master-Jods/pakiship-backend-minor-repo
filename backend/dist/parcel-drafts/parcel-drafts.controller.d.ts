import type { Request } from "express";
import { ParcelDraftsService } from "./parcel-drafts.service";
export declare class ParcelDraftsController {
    private readonly parcelDraftsService;
    constructor(parcelDraftsService: ParcelDraftsService);
    saveStepOne(request: Request, body: Record<string, unknown>): Promise<{
        draftId: any;
    }>;
    getTrackingDetails(request: Request, trackingNumber: string): Promise<{
        trackingNumber: any;
        status: string;
        origin: any;
        destination: any;
        estimatedDelivery: any;
        distance: any;
        deliveryMode: any;
        isBulk: boolean;
        currentLocation: any;
        progress: {
            label: string;
            percentage: number;
        };
        dropOffPoint: {
            id: any;
            name: any;
            address: any;
        };
        driver: {
            name: string;
            phone: string;
            vehicleType: string;
            plateNumber: string;
        };
        timeline: {
            status: string;
            location: any;
            timestamp: string;
            completed: boolean;
        }[];
    }>;
    getBookingQr(request: Request, draftId: string): Promise<{
        draftId: any;
        trackingNumber: any;
        bookingId: any;
        qrToken: string;
        qrValue: string;
        purpose: string;
        service: {
            id: any;
            deliveryMode: any;
            isBulk: boolean;
        };
        customerView: {
            origin: any;
            destination: any;
            currentLocation: any;
            progressLabel: string;
        };
    }>;
    scanBookingQr(request: Request, qrToken: string): Promise<{
        draftId: any;
        trackingNumber: any;
        bookingId: any;
        service: {
            id: any;
            deliveryMode: any;
            isBulk: boolean;
        };
        booking: {
            origin: any;
            destination: any;
            senderName: any;
            receiverName: any;
            currentLocation: any;
            progressLabel: string;
            progressPercentage: number;
        };
        dropOffPoint: {
            id: any;
            name: any;
            address: any;
        };
        scannedBy: import("../common/session/session.types").UserRole;
    }>;
    getHistory(request: Request): Promise<{
        transactions: {
            id: any;
            draftId: any;
            trackingNumber: any;
            date: string;
            createdAt: any;
            from: any;
            to: any;
            status: string;
            rawStatus: any;
            type: string;
            isLive: boolean;
            bucket: "active" | "completed";
            amount: any;
            distance: any;
            duration: any;
            totalParcels: any;
            deliveryMode: any;
            isBulk: boolean;
            currentLocation: any;
            progressLabel: string;
        }[];
    }>;
    getHistoryDetails(request: Request, trackingNumber: string): Promise<{
        transaction: {
            id: any;
            trackingNumber: any;
            date: string;
            createdAt: any;
            from: any;
            to: any;
            status: string;
            rawStatus: any;
            type: string;
            isLive: boolean;
            amount: any;
            distance: any;
            duration: any;
            totalParcels: any;
            deliveryMode: any;
            isBulk: boolean;
            currentLocation: any;
            progressLabel: string;
        };
        details: {
            sender: {
                name: any;
                phone: any;
                address: any;
            };
            receiver: {
                name: any;
                phone: any;
                address: any;
            };
            service: {
                id: any;
                deliveryMode: any;
                isBulk: boolean;
                dropOffPoint: {
                    id: any;
                    name: any;
                    address: any;
                };
            };
            parcel: {
                weight: any;
                dimensions: string;
                description: string;
                specialInstructions: string;
                totalParcels: any;
            };
            driver: {
                name: string;
                phone: string;
                vehicle: string;
                rating: any;
            };
            timeline: {
                status: string;
                time: string;
                location: any;
                completed: boolean;
            }[];
        };
    }>;
    getDraft(request: Request, draftId: string, itemsLimit?: string): Promise<{
        draft: {
            id: any;
            pickupLocation: {
                address: any;
                details: any;
            };
            deliveryLocation: {
                address: any;
                details: any;
            };
            distance: any;
            duration: any;
            stepCompleted: any;
            status: any;
            trackingNumber: any;
            service: {
                id: string;
                price: number;
                deliveryMode: string;
                isBulk: boolean;
                dropOffPoint: {
                    id: string;
                    name: string;
                    address: string;
                    distance: string;
                    status: string;
                    capacity: string;
                };
            };
            tracking: {
                currentLocation: any;
                progressLabel: string;
                progressPercentage: number;
            };
            items: {
                id: any;
                size: any;
                weight: any;
                itemType: any;
                deliveryGuarantee: any;
                quantity: any;
                photoName: any;
            }[];
        };
        pagination: {
            totalItems: number;
            itemsReturned: number;
            limit: number;
            hasMore: boolean;
        };
    }>;
    getDraftItems(request: Request, draftId: string, limit?: string, offset?: string): Promise<{
        items: any;
        pagination: {
            totalItems: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    addDraftItems(request: Request, draftId: string, body: Record<string, unknown>): Promise<{
        itemId: any;
        itemIds: any[];
        createdCount: number;
    }>;
    updateDraftItem(request: Request, draftId: string, itemId: string, body: Record<string, unknown>): Promise<{
        itemId: string;
        quantity: number;
    }>;
    removeDraftItem(request: Request, draftId: string, itemId: string): Promise<{
        itemId: string;
    }>;
    selectService(request: Request, draftId: string, body: Record<string, unknown>): Promise<{
        draftId: string;
        stepCompleted: number;
        status: string;
        service: {
            id: string;
            price: number;
            deliveryMode: string;
            isBulk: boolean;
            dropOffPoint: {
                id: string;
                name: string;
                address: string;
                distance: string;
                status: string;
                capacity: string;
            };
        };
    }>;
    completeBooking(request: Request, draftId: string, body: Record<string, unknown>): Promise<{
        draftId: string;
        trackingNumber: any;
        stepCompleted: number;
        status: string;
        booking: {
            senderName: string;
            senderPhone: string;
            receiverName: string;
            receiverPhone: string;
            paymentMethod: string;
            selectedService: string;
            servicePrice: number;
            totalParcels: number;
            distance: string;
            duration: string;
            deliveryMode: string;
            isBulk: boolean;
            dropOffPoint: {
                id: any;
                name: any;
                address: any;
            };
        };
    }>;
}
