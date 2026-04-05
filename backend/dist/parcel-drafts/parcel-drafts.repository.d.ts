import { SupabaseService } from "../supabase/supabase.service";
export declare class ParcelDraftsRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findOwnedDraftSummary(draftId: string, userId: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
        user_id: any;
        step_completed: any;
        status: any;
        tracking_number: any;
    }>>;
    saveStepOneDraft(draftId: string | null, userId: string, payload: Record<string, unknown>): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
    }>>;
    findOwnedDraftWithItems(draftId: string, userId: string, itemsLimit?: number): Promise<{
        itemCount: number;
        itemPageSize: number;
        error: import("@supabase/postgrest-js").PostgrestError;
        data: null;
        count: null;
        status: number;
        statusText: string;
    } | {
        itemCount: number;
        itemPageSize: number;
        error: null;
        data: {
            id: any;
            pickup_address: any;
            pickup_details: any;
            delivery_address: any;
            delivery_details: any;
            distance_text: any;
            duration_text: any;
            step_completed: any;
            status: any;
            tracking_number: any;
            parcel_draft_items: {
                id: any;
                size: any;
                weight_text: any;
                item_type: any;
                delivery_guarantee: any;
                quantity: any;
                photo_name: any;
            }[];
        };
        count: number | null;
        status: number;
        statusText: string;
    }>;
    listOwnedDraftItemsWithCount(draftId: string, userId: string, limit?: number, offset?: number): Promise<{
        data: any;
        error: Error;
        totalCount: number;
        limit?: undefined;
        offset?: undefined;
    } | {
        data: {
            id: any;
            size: any;
            weight_text: any;
            item_type: any;
            delivery_guarantee: any;
            quantity: any;
            photo_name: any;
        }[];
        error: import("@supabase/postgrest-js").PostgrestError;
        totalCount: number;
        limit: number;
        offset: number;
    }>;
    findOwnedDraftItem(draftId: string, itemId: string, userId: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
        quantity: any;
        parcel_drafts: {
            id: any;
            user_id: any;
        }[];
    }>>;
    createDraftItems(items: Record<string, unknown>[]): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
    }[]>>;
    updateDraftItemQuantity(draftId: string, itemId: string, quantity: number): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    deleteDraftItem(draftId: string, itemId: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    updateOwnedDraftState(draftId: string, userId: string, patch: Record<string, unknown>): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
        status: any;
        tracking_number: any;
    }>>;
    findOwnedSubmittedDraftByTrackingNumber(userId: string, trackingNumber: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
        tracking_number: any;
        pickup_address: any;
        delivery_address: any;
        distance_text: any;
        duration_text: any;
        status: any;
        sender_name: any;
        sender_phone: any;
        receiver_name: any;
        receiver_phone: any;
        created_at: any;
        updated_at: any;
    }>>;
    listOwnedHistory(userId: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
        tracking_number: any;
        pickup_address: any;
        delivery_address: any;
        distance_text: any;
        duration_text: any;
        status: any;
        sender_name: any;
        sender_phone: any;
        receiver_name: any;
        receiver_phone: any;
        created_at: any;
        updated_at: any;
        parcel_draft_items: {
            id: any;
            item_type: any;
            delivery_guarantee: any;
            quantity: any;
            weight_text: any;
        }[];
    }[]>>;
    findOwnedHistoryByTrackingNumber(userId: string, trackingNumber: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<{
        id: any;
        tracking_number: any;
        pickup_address: any;
        delivery_address: any;
        distance_text: any;
        duration_text: any;
        status: any;
        sender_name: any;
        sender_phone: any;
        receiver_name: any;
        receiver_phone: any;
        created_at: any;
        updated_at: any;
        parcel_draft_items: {
            id: any;
            item_type: any;
            delivery_guarantee: any;
            quantity: any;
            weight_text: any;
        }[];
    }>>;
}
