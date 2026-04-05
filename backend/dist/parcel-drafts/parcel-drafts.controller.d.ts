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
        status: any;
        origin: any;
        destination: any;
        estimatedDelivery: any;
        distance: any;
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
            dropOffPoint: unknown;
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
        };
    }>;
}
