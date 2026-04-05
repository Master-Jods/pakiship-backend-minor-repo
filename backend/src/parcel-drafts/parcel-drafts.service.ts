import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { SessionPayload } from "../common/session/session.types";
import { ParcelDraftsRepository } from "./parcel-drafts.repository";
import {
  ALLOWED_SERVICES,
  DEFAULT_ITEMS_PAGE_SIZE,
  MAX_ITEM_QUANTITY,
  MAX_ITEMS_PAGE_SIZE,
  MAX_ITEMS_PER_REQUEST,
} from "./parcel-drafts.constants";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { SupabaseService } from "../supabase/supabase.service";

const PHONE_REGEX = /^09\d{9}$/;

type DraftItemInput = {
  size?: unknown;
  weight?: unknown;
  itemType?: unknown;
  deliveryGuarantee?: unknown;
  quantity?: unknown;
  photoName?: unknown;
};

function asNonEmptyString(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parsePositiveInteger(value: unknown, fallback = 1) {
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

@Injectable()
export class ParcelDraftsService {
  constructor(
    private readonly repository: ParcelDraftsRepository,
    private readonly customerNotificationsService: CustomerNotificationsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async saveRouteDetails(user: SessionPayload, body: Record<string, unknown>) {
    const draftId = body.draftId ? String(body.draftId) : null;
    const pickupAddress = asNonEmptyString(
      (body.pickupLocation as { address?: unknown } | undefined)?.address,
    );
    const deliveryAddress = asNonEmptyString(
      (body.deliveryLocation as { address?: unknown } | undefined)?.address,
    );

    if (!pickupAddress || !deliveryAddress) {
      throw new BadRequestException("Pickup and delivery locations are required.");
    }

    const { data, error } = await this.repository.saveStepOneDraft(draftId, user.userId, {
      pickup_address: pickupAddress,
      pickup_details: asNonEmptyString(
        (body.pickupLocation as { details?: unknown } | undefined)?.details,
      ),
      delivery_address: deliveryAddress,
      delivery_details: asNonEmptyString(
        (body.deliveryLocation as { details?: unknown } | undefined)?.details,
      ),
      distance_text: asNonEmptyString(body.distance),
      duration_text: asNonEmptyString(body.duration),
      step_completed: 1,
      status: "draft",
    });

    if (error || !data) {
      throw new InternalServerErrorException(
        draftId ? "Unable to update parcel draft." : "Unable to create parcel draft.",
      );
    }

    return { draftId: data.id };
  }

  async getDraftDetails(user: SessionPayload, draftId: string, itemsLimit?: number) {
    const limit = Math.min(
      Math.max(itemsLimit ?? DEFAULT_ITEMS_PAGE_SIZE, 1),
      MAX_ITEMS_PAGE_SIZE,
    );
    const { data, error, itemCount, itemPageSize } = await this.repository.findOwnedDraftWithItems(
      draftId,
      user.userId,
      limit,
    );

    if (error || !data) {
      throw new NotFoundException("Parcel draft not found.");
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

  async getDraftItemsPage(user: SessionPayload, draftId: string, limit?: number, offset?: number) {
    const requestedLimit = Math.min(
      Math.max(limit ?? DEFAULT_ITEMS_PAGE_SIZE, 1),
      MAX_ITEMS_PAGE_SIZE,
    );
    const safeOffset = Math.max(offset ?? 0, 0);
    const { data, error, totalCount } = await this.repository.listOwnedDraftItemsWithCount(
      draftId,
      user.userId,
      requestedLimit,
      safeOffset,
    );

    if (error || !data) {
      throw new NotFoundException("Parcel draft not found.");
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

  private normalizeDraftItemInput(input: DraftItemInput) {
    const size = asNonEmptyString(input.size);
    const weight = asNonEmptyString(input.weight);
    const itemType = asNonEmptyString(input.itemType);
    const deliveryGuarantee = asNonEmptyString(input.deliveryGuarantee);
    const quantity = parsePositiveInteger(input.quantity, 1);

    if (!size || !weight || !itemType || !deliveryGuarantee) {
      throw new BadRequestException("Parcel details are incomplete.");
    }

    if (!quantity || quantity > MAX_ITEM_QUANTITY) {
      throw new BadRequestException(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`);
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

  async addDraftItems(user: SessionPayload, draftId: string, body: Record<string, unknown>) {
    const ownedDraft = await this.repository.findOwnedDraftSummary(draftId, user.userId);
    if (ownedDraft.error || !ownedDraft.data) {
      throw new NotFoundException("Parcel draft not found.");
    }

    const rawItems = Array.isArray(body.items) ? body.items : [body];
    if (rawItems.length < 1 || rawItems.length > MAX_ITEMS_PER_REQUEST) {
      throw new BadRequestException(
        `You can submit between 1 and ${MAX_ITEMS_PER_REQUEST} items per request.`,
      );
    }

    const normalizedItems = rawItems.map((rawItem) => ({
      parcel_draft_id: draftId,
      ...this.normalizeDraftItemInput((rawItem ?? {}) as DraftItemInput),
    }));

    const { data, error } = await this.repository.createDraftItems(normalizedItems);
    if (error || !data) {
      throw new InternalServerErrorException("Unable to save parcel item.");
    }

    const stepResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
      step_completed: 3,
    });

    if (stepResult.error) {
      throw new InternalServerErrorException("Unable to update parcel draft progress.");
    }

    return {
      itemId: data[0]?.id ?? null,
      itemIds: data.map((item) => item.id),
      createdCount: data.length,
    };
  }

  async updateDraftItem(
    user: SessionPayload,
    draftId: string,
    itemId: string,
    body: Record<string, unknown>,
  ) {
    const quantity = parsePositiveInteger(body.quantity);
    if (!quantity || quantity > MAX_ITEM_QUANTITY) {
      throw new BadRequestException(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`);
    }

    const ownedItem = await this.repository.findOwnedDraftItem(draftId, itemId, user.userId);
    if (ownedItem.error || !ownedItem.data) {
      throw new NotFoundException("Parcel item not found.");
    }

    const updateResult = await this.repository.updateDraftItemQuantity(draftId, itemId, quantity);
    if (updateResult.error) {
      throw new InternalServerErrorException("Unable to update parcel quantity.");
    }

    const stepResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
      step_completed: 3,
    });
    if (stepResult.error) {
      throw new InternalServerErrorException("Unable to update parcel draft progress.");
    }

    return { itemId, quantity };
  }

  async removeDraftItem(user: SessionPayload, draftId: string, itemId: string) {
    const ownedItem = await this.repository.findOwnedDraftItem(draftId, itemId, user.userId);
    if (ownedItem.error || !ownedItem.data) {
      throw new NotFoundException("Parcel item not found.");
    }

    const deleteResult = await this.repository.deleteDraftItem(draftId, itemId);
    if (deleteResult.error) {
      throw new InternalServerErrorException("Unable to remove parcel item.");
    }

    const stepResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
      step_completed: 3,
    });
    if (stepResult.error) {
      throw new InternalServerErrorException("Unable to update parcel draft progress.");
    }

    return { itemId };
  }

  async selectDraftService(user: SessionPayload, draftId: string, body: Record<string, unknown>) {
    const serviceId = String(body.serviceId ?? "");
    const servicePrice = Number(body.servicePrice ?? 0);
    const dropOffPoint = body.dropOffPoint ?? null;

    if (!ALLOWED_SERVICES.has(serviceId)) {
      throw new BadRequestException("Please select a valid delivery service.");
    }

    if (!Number.isFinite(servicePrice) || servicePrice <= 0) {
      throw new BadRequestException("Service pricing is invalid.");
    }

    if (serviceId === "pakishare" && !(dropOffPoint as { id?: unknown } | null)?.id) {
      throw new BadRequestException("PakiShare requires a drop-off hub selection.");
    }

    const ownedDraft = await this.repository.findOwnedDraftSummary(draftId, user.userId);
    if (ownedDraft.error || !ownedDraft.data) {
      throw new NotFoundException("Parcel draft not found.");
    }

    const updateResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
      step_completed: 4,
      status: "draft",
    });
    if (updateResult.error) {
      throw new InternalServerErrorException("Unable to save delivery service right now.");
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

  async completeBooking(user: SessionPayload, draftId: string, body: Record<string, unknown>) {
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
      throw new BadRequestException("Sender and receiver names are required.");
    }

    if (!PHONE_REGEX.test(senderPhone) || !PHONE_REGEX.test(receiverPhone)) {
      throw new BadRequestException("Phone numbers must use the 09XXXXXXXXX format.");
    }

    if (!paymentMethod) {
      throw new BadRequestException("Please select a payment method before continuing.");
    }

    if (!selectedService || !Number.isFinite(servicePrice) || servicePrice <= 0) {
      throw new BadRequestException("Delivery service details are incomplete.");
    }

    const ownedDraft = await this.repository.findOwnedDraftSummary(draftId, user.userId);
    if (ownedDraft.error || !ownedDraft.data) {
      throw new NotFoundException("Parcel draft not found.");
    }

    const updateResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
      step_completed: 5,
      status: "submitted",
    });
    if (updateResult.error) {
      throw new InternalServerErrorException("Unable to complete booking right now.");
    }

    const trackingNumber = createTrackingNumber();
    await this.customerNotificationsService.createNotification(
      user.userId,
      "delivery",
      "Parcel booking confirmed",
      `Your parcel for ${receiverName} is booked. Tracking No. ${trackingNumber}.`,
    );

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
}
