"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelDraftsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const parcel_drafts_constants_1 = require("./parcel-drafts.constants");
let ParcelDraftsRepository = class ParcelDraftsRepository {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findOwnedDraftSummary(draftId, userId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          user_id,
          step_completed,
          status,
          tracking_number,
          service_id,
          service_price,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          drop_off_point_distance_text,
          drop_off_point_status,
          drop_off_point_capacity,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage
        `)
            .eq("id", draftId)
            .eq("user_id", userId)
            .single();
    }
    async saveStepOneDraft(draftId, userId, payload) {
        const supabase = this.supabaseService.createAdminClient();
        const fullPayload = {
            user_id: userId,
            ...payload,
        };
        if (draftId) {
            return supabase
                .from("parcel_drafts")
                .update(fullPayload)
                .eq("id", draftId)
                .eq("user_id", userId)
                .select("id")
                .single();
        }
        return supabase
            .from("parcel_drafts")
            .insert(fullPayload)
            .select("id")
            .single();
    }
    async findOwnedDraftWithItems(draftId, userId, itemsLimit = parcel_drafts_constants_1.DEFAULT_ITEMS_PAGE_SIZE) {
        const cappedLimit = Math.min(Math.max(itemsLimit, 1), parcel_drafts_constants_1.MAX_ITEMS_PAGE_SIZE);
        const supabase = this.supabaseService.createAdminClient();
        const draftResult = await supabase
            .from("parcel_drafts")
            .select(`
          id,
          pickup_address,
          pickup_details,
          delivery_address,
          delivery_details,
          distance_text,
          duration_text,
          step_completed,
          status,
          tracking_number,
          service_id,
          service_price,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          drop_off_point_distance_text,
          drop_off_point_status,
          drop_off_point_capacity,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          parcel_draft_items (
            id,
            size,
            weight_text,
            item_type,
            delivery_guarantee,
            quantity,
            photo_name
          )
        `)
            .eq("id", draftId)
            .eq("user_id", userId)
            .order("id", { ascending: true, referencedTable: "parcel_draft_items" })
            .limit(cappedLimit, { foreignTable: "parcel_draft_items" })
            .single();
        const countResult = await supabase
            .from("parcel_draft_items")
            .select("id", { count: "exact", head: true })
            .eq("parcel_draft_id", draftId);
        return {
            ...draftResult,
            itemCount: countResult.count ?? 0,
            itemPageSize: cappedLimit,
        };
    }
    async listOwnedDraftItemsWithCount(draftId, userId, limit = parcel_drafts_constants_1.DEFAULT_ITEMS_PAGE_SIZE, offset = 0) {
        const cappedLimit = Math.min(Math.max(limit, 1), parcel_drafts_constants_1.MAX_ITEMS_PAGE_SIZE);
        const safeOffset = Math.max(offset, 0);
        const supabase = this.supabaseService.createAdminClient();
        const { data: draft, error: draftError } = await supabase
            .from("parcel_drafts")
            .select("id")
            .eq("id", draftId)
            .eq("user_id", userId)
            .single();
        if (draftError || !draft) {
            return { data: null, error: draftError ?? new Error("Draft not found"), totalCount: 0 };
        }
        const { data, error, count } = await supabase
            .from("parcel_draft_items")
            .select("id, size, weight_text, item_type, delivery_guarantee, quantity, photo_name", { count: "exact" })
            .eq("parcel_draft_id", draftId)
            .order("id", { ascending: true })
            .range(safeOffset, safeOffset + cappedLimit - 1);
        return { data, error, totalCount: count ?? 0, limit: cappedLimit, offset: safeOffset };
    }
    async findOwnedDraftItem(draftId, itemId, userId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_draft_items")
            .select(`
        id,
        quantity,
        parcel_drafts!inner (
          id,
          user_id
        )
      `)
            .eq("id", itemId)
            .eq("parcel_draft_id", draftId)
            .eq("parcel_drafts.user_id", userId)
            .single();
    }
    async createDraftItems(items) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase.from("parcel_draft_items").insert(items).select("id");
    }
    async listOwnedDraftItemQuantities(draftId, userId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_draft_items")
            .select(`
        quantity,
        parcel_drafts!inner (
          id,
          user_id
        )
      `)
            .eq("parcel_draft_id", draftId)
            .eq("parcel_drafts.user_id", userId);
    }
    async updateDraftItemQuantity(draftId, itemId, quantity) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_draft_items")
            .update({ quantity })
            .eq("id", itemId)
            .eq("parcel_draft_id", draftId);
    }
    async deleteDraftItem(draftId, itemId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_draft_items")
            .delete()
            .eq("id", itemId)
            .eq("parcel_draft_id", draftId);
    }
    async updateOwnedDraftState(draftId, userId, patch) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .update(patch)
            .eq("id", draftId)
            .eq("user_id", userId)
            .select("id, status, tracking_number, service_id, delivery_mode, is_bulk")
            .single();
    }
    async findOwnedSubmittedDraftByTrackingNumber(userId, trackingNumber) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          service_id,
          service_price,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          created_at,
          updated_at
        `)
            .eq("user_id", userId)
            .eq("tracking_number", trackingNumber)
            .eq("status", "submitted")
            .single();
    }
    async findOwnedSubmittedDraftById(userId, draftId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          service_id,
          service_price,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          created_at,
          updated_at
        `)
            .eq("user_id", userId)
            .eq("id", draftId)
            .eq("status", "submitted")
            .single();
    }
    async listOwnedHistory(userId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          service_id,
          service_price,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          created_at,
          updated_at,
          parcel_draft_items (
            id,
            item_type,
            delivery_guarantee,
            quantity,
            weight_text
          )
        `)
            .eq("user_id", userId)
            .in("status", ["submitted", "cancelled"])
            .order("created_at", { ascending: false });
    }
    async findOwnedHistoryByTrackingNumber(userId, trackingNumber) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          service_id,
          service_price,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          created_at,
          updated_at,
          parcel_draft_items (
            id,
            item_type,
            delivery_guarantee,
            quantity,
            weight_text
          )
        `)
            .eq("user_id", userId)
            .eq("tracking_number", trackingNumber)
            .single();
    }
    async findSubmittedDraftByTrackingNumber(trackingNumber) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          user_id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          service_id,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          sender_name,
          receiver_name,
          created_at,
          updated_at
        `)
            .eq("tracking_number", trackingNumber)
            .eq("status", "submitted")
            .maybeSingle();
    }
    async listRelayBookingsForHub(hubId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          created_at,
          updated_at,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          service_id,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          drop_off_point_distance_text,
          drop_off_point_status,
          drop_off_point_capacity,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          parcel_draft_items (
            id,
            item_type,
            quantity,
            weight_text
          )
        `)
            .eq("service_id", "pakishare")
            .eq("drop_off_point_id", hubId)
            .in("status", ["draft", "submitted"])
            .order("updated_at", { ascending: false });
    }
    async listRecentRelayBookings(limit = 10) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          created_at,
          updated_at,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          service_id,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          drop_off_point_distance_text,
          drop_off_point_status,
          drop_off_point_capacity,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          parcel_draft_items (
            id,
            item_type,
            quantity,
            weight_text
          )
        `)
            .eq("service_id", "pakishare")
            .in("status", ["draft", "submitted"])
            .order("updated_at", { ascending: false })
            .limit(limit);
    }
    async findRelayBookingById(draftId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          user_id,
          tracking_number,
          status,
          service_id,
          delivery_mode,
          drop_off_point_id,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          receiver_name
        `)
            .eq("id", draftId)
            .eq("service_id", "pakishare")
            .maybeSingle();
    }
    async updateRelayBookingTracking(draftId, patch) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .update(patch)
            .eq("id", draftId)
            .eq("service_id", "pakishare")
            .select("id, tracking_number, tracking_current_location, tracking_progress_label, tracking_progress_percentage")
            .single();
    }
    async listDriverBookingRequests(deliveryType, updatedSince) {
        const supabase = this.supabaseService.createAdminClient();
        let query = supabase
            .from("parcel_drafts")
            .select(`
          id,
          user_id,
          tracking_number,
          pickup_address,
          delivery_address,
          distance_text,
          duration_text,
          status,
          created_at,
          updated_at,
          sender_name,
          receiver_name,
          service_id,
          delivery_mode,
          is_bulk,
          drop_off_point_id,
          drop_off_point_name,
          drop_off_point_address,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          assigned_driver_id,
          assigned_driver_name,
          parcel_draft_items (
            id,
            item_type,
            quantity
          )
        `)
            .eq("status", "submitted")
            .is("assigned_driver_id", null)
            .order("updated_at", { ascending: false });
        if (deliveryType) {
            query = query.eq("delivery_mode", deliveryType);
        }
        if (updatedSince) {
            query = query.gt("updated_at", updatedSince);
        }
        return query;
    }
    async findDriverBookingRequestById(draftId) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .select(`
          id,
          user_id,
          tracking_number,
          pickup_address,
          delivery_address,
          status,
          delivery_mode,
          drop_off_point_name,
          assigned_driver_id
        `)
            .eq("id", draftId)
            .eq("status", "submitted")
            .maybeSingle();
    }
    async acceptDriverBookingRequest(draftId, patch) {
        const supabase = this.supabaseService.createAdminClient();
        return supabase
            .from("parcel_drafts")
            .update(patch)
            .eq("id", draftId)
            .eq("status", "submitted")
            .select("id, tracking_number, assigned_driver_id, assigned_driver_name, tracking_progress_label")
            .single();
    }
};
exports.ParcelDraftsRepository = ParcelDraftsRepository;
exports.ParcelDraftsRepository = ParcelDraftsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ParcelDraftsRepository);
