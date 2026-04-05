import type { SessionPayload } from "../common/session/session.types";
import { ParcelDraftsRepository } from "./parcel-drafts.repository";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { SupabaseService } from "../supabase/supabase.service";
export declare class ParcelDraftsService {
    private readonly repository;
    private readonly customerNotificationsService;
    private readonly supabaseService;
    constructor(repository: ParcelDraftsRepository, customerNotificationsService: CustomerNotificationsService, supabaseService: SupabaseService);
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
    getTrackingDetails(user: SessionPayload, trackingNumber: string): Promise<{
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
    getHistory(user: SessionPayload): Promise<{
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
    getHistoryDetails(user: SessionPayload, trackingNumber: string): Promise<{
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
}
