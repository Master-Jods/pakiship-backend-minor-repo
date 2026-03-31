import type { SessionPayload } from "../common/session/session.types";
import { ParcelDraftsRepository } from "./parcel-drafts.repository";
export declare class ParcelDraftsService {
    private readonly repository;
    constructor(repository: ParcelDraftsRepository);
    saveRouteDetails(user: SessionPayload, body: Record<string, unknown>): Promise<{
        draftId: any;
    }>;
    getDraftDetails(user: SessionPayload, draftId: string, itemsLimit?: number): Promise<{
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
    getDraftItemsPage(user: SessionPayload, draftId: string, limit?: number, offset?: number): Promise<{
        items: any;
        pagination: {
            totalItems: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    private normalizeDraftItemInput;
    addDraftItems(user: SessionPayload, draftId: string, body: Record<string, unknown>): Promise<{
        itemId: any;
        itemIds: any[];
        createdCount: number;
    }>;
    updateDraftItem(user: SessionPayload, draftId: string, itemId: string, body: Record<string, unknown>): Promise<{
        itemId: string;
        quantity: number;
    }>;
    removeDraftItem(user: SessionPayload, draftId: string, itemId: string): Promise<{
        itemId: string;
    }>;
    selectDraftService(user: SessionPayload, draftId: string, body: Record<string, unknown>): Promise<{
        draftId: string;
        stepCompleted: number;
        status: string;
        service: {
            id: string;
            price: number;
            dropOffPoint: unknown;
        };
    }>;
    completeBooking(user: SessionPayload, draftId: string, body: Record<string, unknown>): Promise<{
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
