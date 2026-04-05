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
exports.ParcelDraftsService = void 0;
const common_1 = require("@nestjs/common");
const parcel_drafts_repository_1 = require("./parcel-drafts.repository");
const parcel_drafts_constants_1 = require("./parcel-drafts.constants");
const customer_notifications_service_1 = require("../customer-notifications/customer-notifications.service");
const supabase_service_1 = require("../supabase/supabase.service");
const PHONE_REGEX = /^09\d{9}$/;
function asNonEmptyString(value) {
    const text = String(value ?? "").trim();
    return text.length > 0 ? text : null;
}
function parsePositiveInteger(value, fallback = 1) {
    const number = Number(value ?? fallback);
    if (!Number.isInteger(number) || number < 1) {
        return null;
    }
    return number;
}
function createTrackingNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const serial = Math.floor(100000 + Math.random() * 900000);
    return `PKS-${year}-${serial}`;
}
let ParcelDraftsService = class ParcelDraftsService {
    constructor(repository, customerNotificationsService, supabaseService) {
        this.repository = repository;
        this.customerNotificationsService = customerNotificationsService;
        this.supabaseService = supabaseService;
    }
    async saveRouteDetails(user, body) {
        const draftId = body.draftId ? String(body.draftId) : null;
        const pickupAddress = asNonEmptyString(body.pickupLocation?.address);
        const deliveryAddress = asNonEmptyString(body.deliveryLocation?.address);
        if (!pickupAddress || !deliveryAddress) {
            throw new common_1.BadRequestException("Pickup and delivery locations are required.");
        }
        const { data, error } = await this.repository.saveStepOneDraft(draftId, user.userId, {
            pickup_address: pickupAddress,
            pickup_details: asNonEmptyString(body.pickupLocation?.details),
            delivery_address: deliveryAddress,
            delivery_details: asNonEmptyString(body.deliveryLocation?.details),
            distance_text: asNonEmptyString(body.distance),
            duration_text: asNonEmptyString(body.duration),
            step_completed: 1,
            status: "draft",
        });
        if (error || !data) {
            throw new common_1.InternalServerErrorException(draftId ? "Unable to update parcel draft." : "Unable to create parcel draft.");
        }
        return { draftId: data.id };
    }
    async getDraftDetails(user, draftId, itemsLimit) {
        const limit = Math.min(Math.max(itemsLimit ?? parcel_drafts_constants_1.DEFAULT_ITEMS_PAGE_SIZE, 1), parcel_drafts_constants_1.MAX_ITEMS_PAGE_SIZE);
        const { data, error, itemCount, itemPageSize } = await this.repository.findOwnedDraftWithItems(draftId, user.userId, limit);
        if (error || !data) {
            throw new common_1.NotFoundException("Parcel draft not found.");
        }
        const items = (data.parcel_draft_items ?? []).map((item) => ({
            id: item.id,
            size: item.size,
            weight: item.weight_text,
            itemType: item.item_type,
            deliveryGuarantee: item.delivery_guarantee,
            quantity: item.quantity,
            photoName: item.photo_name,
        }));
        return {
            draft: {
                id: data.id,
                pickupLocation: {
                    address: data.pickup_address,
                    details: data.pickup_details,
                },
                deliveryLocation: {
                    address: data.delivery_address,
                    details: data.delivery_details,
                },
                distance: data.distance_text,
                duration: data.duration_text,
                stepCompleted: data.step_completed,
                status: data.status,
                items,
            },
            pagination: {
                totalItems: itemCount,
                itemsReturned: items.length,
                limit: itemPageSize,
                hasMore: itemCount > items.length,
            },
        };
    }
    async getDraftItemsPage(user, draftId, limit, offset) {
        const requestedLimit = Math.min(Math.max(limit ?? parcel_drafts_constants_1.DEFAULT_ITEMS_PAGE_SIZE, 1), parcel_drafts_constants_1.MAX_ITEMS_PAGE_SIZE);
        const safeOffset = Math.max(offset ?? 0, 0);
        const { data, error, totalCount } = await this.repository.listOwnedDraftItemsWithCount(draftId, user.userId, requestedLimit, safeOffset);
        if (error || !data) {
            throw new common_1.NotFoundException("Parcel draft not found.");
        }
        return {
            items: data.map((item) => ({
                id: item.id,
                size: item.size,
                weight: item.weight_text,
                itemType: item.item_type,
                deliveryGuarantee: item.delivery_guarantee,
                quantity: item.quantity,
                photoName: item.photo_name,
            })),
            pagination: {
                totalItems: totalCount,
                limit: requestedLimit,
                offset: safeOffset,
                hasMore: safeOffset + data.length < totalCount,
            },
        };
    }
    normalizeDraftItemInput(input) {
        const size = asNonEmptyString(input.size);
        const weight = asNonEmptyString(input.weight);
        const itemType = asNonEmptyString(input.itemType);
        const deliveryGuarantee = asNonEmptyString(input.deliveryGuarantee);
        const quantity = parsePositiveInteger(input.quantity, 1);
        if (!size || !weight || !itemType || !deliveryGuarantee) {
            throw new common_1.BadRequestException("Parcel details are incomplete.");
        }
        if (!quantity || quantity > parcel_drafts_constants_1.MAX_ITEM_QUANTITY) {
            throw new common_1.BadRequestException(`Quantity must be between 1 and ${parcel_drafts_constants_1.MAX_ITEM_QUANTITY}.`);
        }
        return {
            size,
            weight_text: weight,
            item_type: itemType,
            delivery_guarantee: deliveryGuarantee,
            quantity,
            photo_name: asNonEmptyString(input.photoName),
        };
    }
    async addDraftItems(user, draftId, body) {
        const ownedDraft = await this.repository.findOwnedDraftSummary(draftId, user.userId);
        if (ownedDraft.error || !ownedDraft.data) {
            throw new common_1.NotFoundException("Parcel draft not found.");
        }
        const rawItems = Array.isArray(body.items) ? body.items : [body];
        if (rawItems.length < 1 || rawItems.length > parcel_drafts_constants_1.MAX_ITEMS_PER_REQUEST) {
            throw new common_1.BadRequestException(`You can submit between 1 and ${parcel_drafts_constants_1.MAX_ITEMS_PER_REQUEST} items per request.`);
        }
        const normalizedItems = rawItems.map((rawItem) => ({
            parcel_draft_id: draftId,
            ...this.normalizeDraftItemInput((rawItem ?? {})),
        }));
        const { data, error } = await this.repository.createDraftItems(normalizedItems);
        if (error || !data) {
            throw new common_1.InternalServerErrorException("Unable to save parcel item.");
        }
        const stepResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
            step_completed: 3,
        });
        if (stepResult.error) {
            throw new common_1.InternalServerErrorException("Unable to update parcel draft progress.");
        }
        return {
            itemId: data[0]?.id ?? null,
            itemIds: data.map((item) => item.id),
            createdCount: data.length,
        };
    }
    async updateDraftItem(user, draftId, itemId, body) {
        const quantity = parsePositiveInteger(body.quantity);
        if (!quantity || quantity > parcel_drafts_constants_1.MAX_ITEM_QUANTITY) {
            throw new common_1.BadRequestException(`Quantity must be between 1 and ${parcel_drafts_constants_1.MAX_ITEM_QUANTITY}.`);
        }
        const ownedItem = await this.repository.findOwnedDraftItem(draftId, itemId, user.userId);
        if (ownedItem.error || !ownedItem.data) {
            throw new common_1.NotFoundException("Parcel item not found.");
        }
        const updateResult = await this.repository.updateDraftItemQuantity(draftId, itemId, quantity);
        if (updateResult.error) {
            throw new common_1.InternalServerErrorException("Unable to update parcel quantity.");
        }
        const stepResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
            step_completed: 3,
        });
        if (stepResult.error) {
            throw new common_1.InternalServerErrorException("Unable to update parcel draft progress.");
        }
        return { itemId, quantity };
    }
    async removeDraftItem(user, draftId, itemId) {
        const ownedItem = await this.repository.findOwnedDraftItem(draftId, itemId, user.userId);
        if (ownedItem.error || !ownedItem.data) {
            throw new common_1.NotFoundException("Parcel item not found.");
        }
        const deleteResult = await this.repository.deleteDraftItem(draftId, itemId);
        if (deleteResult.error) {
            throw new common_1.InternalServerErrorException("Unable to remove parcel item.");
        }
        const stepResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
            step_completed: 3,
        });
        if (stepResult.error) {
            throw new common_1.InternalServerErrorException("Unable to update parcel draft progress.");
        }
        return { itemId };
    }
    async selectDraftService(user, draftId, body) {
        const serviceId = String(body.serviceId ?? "");
        const servicePrice = Number(body.servicePrice ?? 0);
        const dropOffPoint = body.dropOffPoint ?? null;
        if (!parcel_drafts_constants_1.ALLOWED_SERVICES.has(serviceId)) {
            throw new common_1.BadRequestException("Please select a valid delivery service.");
        }
        if (!Number.isFinite(servicePrice) || servicePrice <= 0) {
            throw new common_1.BadRequestException("Service pricing is invalid.");
        }
        if (serviceId === "pakishare" && !dropOffPoint?.id) {
            throw new common_1.BadRequestException("PakiShare requires a drop-off hub selection.");
        }
        const ownedDraft = await this.repository.findOwnedDraftSummary(draftId, user.userId);
        if (ownedDraft.error || !ownedDraft.data) {
            throw new common_1.NotFoundException("Parcel draft not found.");
        }
        const updateResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
            step_completed: 4,
            status: "draft",
        });
        if (updateResult.error) {
            throw new common_1.InternalServerErrorException("Unable to save delivery service right now.");
        }
        return {
            draftId,
            stepCompleted: 4,
            status: "draft",
            service: {
                id: serviceId,
                price: servicePrice,
                dropOffPoint,
            },
        };
    }
    async completeBooking(user, draftId, body) {
        const senderName = asNonEmptyString(body.senderName);
        const senderPhone = String(body.senderPhone ?? "").trim();
        const receiverName = asNonEmptyString(body.receiverName);
        const receiverPhone = String(body.receiverPhone ?? "").trim();
        const paymentMethod = asNonEmptyString(body.paymentMethod);
        const selectedService = asNonEmptyString(body.selectedService);
        const servicePrice = Number(body.servicePrice ?? 0);
        const totalParcels = Number(body.totalParcels ?? 0);
        const distance = asNonEmptyString(body.distance) ?? "";
        const duration = asNonEmptyString(body.duration) ?? "";
        if (!senderName || !receiverName) {
            throw new common_1.BadRequestException("Sender and receiver names are required.");
        }
        if (!PHONE_REGEX.test(senderPhone) || !PHONE_REGEX.test(receiverPhone)) {
            throw new common_1.BadRequestException("Phone numbers must use the 09XXXXXXXXX format.");
        }
        if (!paymentMethod) {
            throw new common_1.BadRequestException("Please select a payment method before continuing.");
        }
        if (!selectedService || !Number.isFinite(servicePrice) || servicePrice <= 0) {
            throw new common_1.BadRequestException("Delivery service details are incomplete.");
        }
        const ownedDraft = await this.repository.findOwnedDraftSummary(draftId, user.userId);
        if (ownedDraft.error || !ownedDraft.data) {
            throw new common_1.NotFoundException("Parcel draft not found.");
        }
        const updateResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
            step_completed: 5,
            status: "submitted",
        });
        if (updateResult.error) {
            throw new common_1.InternalServerErrorException("Unable to complete booking right now.");
        }
        const trackingNumber = createTrackingNumber();
        await this.customerNotificationsService.createNotification(user.userId, "delivery", "Parcel booking confirmed", `Your parcel for ${receiverName} is booked. Tracking No. ${trackingNumber}.`);
        const admin = this.supabaseService.createAdminClient();
        await admin.from("customer_activity_logs").insert({
            user_id: user.userId,
            activity_type: "booking",
            title: "Parcel booking confirmed",
            description: `You booked a parcel for ${receiverName}. Tracking No. ${trackingNumber}.`,
        });
        return {
            draftId,
            trackingNumber,
            stepCompleted: 5,
            status: "submitted",
            booking: {
                senderName,
                senderPhone,
                receiverName,
                receiverPhone,
                paymentMethod,
                selectedService,
                servicePrice,
                totalParcels,
                distance,
                duration,
            },
        };
    }
};
exports.ParcelDraftsService = ParcelDraftsService;
exports.ParcelDraftsService = ParcelDraftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcel_drafts_repository_1.ParcelDraftsRepository,
        customer_notifications_service_1.CustomerNotificationsService,
        supabase_service_1.SupabaseService])
], ParcelDraftsService);
