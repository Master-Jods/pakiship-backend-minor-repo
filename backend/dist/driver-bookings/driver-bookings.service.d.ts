import type { SessionPayload } from "../common/session/session.types";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { ParcelDraftsRepository } from "../parcel-drafts/parcel-drafts.repository";
export declare class DriverBookingsService {
    private readonly parcelDraftsRepository;
    private readonly customerNotificationsService;
    constructor(parcelDraftsRepository: ParcelDraftsRepository, customerNotificationsService: CustomerNotificationsService);
    private ensureDriver;
    listBookingRequests(session: SessionPayload, deliveryType?: string, updatedSince?: string): Promise<{
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
    acceptBookingRequest(session: SessionPayload, draftId: string): Promise<{
        draftId: string;
        trackingNumber: any;
        assignedDriver: {
            id: string;
            fullName: string;
        };
        progressLabel: any;
    }>;
}
