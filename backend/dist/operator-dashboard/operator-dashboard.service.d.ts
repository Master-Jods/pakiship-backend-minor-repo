import type { SessionPayload } from "../common/session/session.types";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { ParcelDraftsRepository } from "../parcel-drafts/parcel-drafts.repository";
import { SupabaseService } from "../supabase/supabase.service";
export declare class OperatorDashboardService {
    private readonly supabaseService;
    private readonly parcelDraftsRepository;
    private readonly customerNotificationsService;
    constructor(supabaseService: SupabaseService, parcelDraftsRepository: ParcelDraftsRepository, customerNotificationsService: CustomerNotificationsService);
    private findActiveHubId;
    private loadKpiMetrics;
    private loadEarningsMetrics;
    getDashboard(session: SessionPayload): Promise<{
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
    getRelayBookings(session: SessionPayload): Promise<{
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
    updateRelayBookingStatus(session: SessionPayload, draftId: string, input: {
        currentLocation?: unknown;
        progressLabel?: unknown;
        progressPercentage?: unknown;
    }): Promise<{
        draftId: string;
        trackingNumber: any;
        currentLocation: any;
        progressLabel: any;
        progressPercentage: number;
    }>;
}
