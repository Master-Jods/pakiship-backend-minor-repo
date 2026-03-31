import type { Request } from "express";
import { ParcelDraftsService } from "./parcel-drafts.service";
export declare class ParcelDraftsController {
    private readonly parcelDraftsService;
    constructor(parcelDraftsService: ParcelDraftsService);
    saveStepOne(request: Request, body: Record<string, unknown>): Promise<{
        draftId: any;
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
        trackingNumber: string;
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
