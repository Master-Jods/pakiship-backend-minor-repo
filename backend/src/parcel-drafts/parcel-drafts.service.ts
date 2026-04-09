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
const AVAILABLE_HUBS = [
  {
    id: "hub-1",
    name: "SM North EDSA PakiHub",
    address: "North Ave, Quezon City",
    distance: "1.2 km",
    status: "Open",
    capacity: "High",
  },
  {
    id: "hub-2",
    name: "Cubao Expo Terminal",
    address: "Socorro, Quezon City",
    distance: "4.5 km",
    status: "Busy",
    capacity: "Medium",
  },
  {
    id: "hub-3",
    name: "BGC High Street Hub",
    address: "Taguig, Metro Manila",
    distance: "12.0 km",
    status: "Open",
    capacity: "Full",
  },
  {
    id: "hub-4",
    name: "Makati Central Hub",
    address: "Ayala Ave, Makati",
    distance: "15.3 km",
    status: "Open",
    capacity: "High",
  },
];

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

function formatHistoryDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getHistoryStatus(status: string) {
  if (status === "submitted") {
    return {
      label: "Booking Confirmed",
      isLive: true,
      bucket: "active" as const,
    };
  }

  return {
    label: "Cancelled",
    isLive: false,
    bucket: "completed" as const,
  };
}

function getHistoryType(items: Array<{ item_type?: string | null; delivery_guarantee?: string | null }>) {
  const firstItem = items[0];
  if (!firstItem) return "Parcel Delivery";
  if (firstItem.delivery_guarantee) {
    return `${String(firstItem.delivery_guarantee).charAt(0).toUpperCase()}${String(
      firstItem.delivery_guarantee,
    ).slice(1)} Delivery`;
  }
  if (firstItem.item_type) {
    return String(firstItem.item_type);
  }
  return "Parcel Delivery";
}

function hashAddressSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 10000;
  }

  return hash;
}

function createRouteEstimate(pickupAddress: string, deliveryAddress: string) {
  const combinedSeed = hashAddressSeed(
    `${pickupAddress.toLowerCase()}::${deliveryAddress.toLowerCase()}`,
  );
  const baseDistance = 2 + (combinedSeed % 240) / 10;
  const distanceKm = Math.max(1.5, Number(baseDistance.toFixed(1)));
  const durationMinutes = Math.max(12, Math.round(distanceKm * 4.5 + 8));

  return {
    distanceKm,
    durationMinutes,
    distanceText: `${distanceKm.toFixed(1)} km`,
    durationText:
      durationMinutes >= 60
        ? `${Math.floor(durationMinutes / 60)} hr ${durationMinutes % 60} mins`
        : `${durationMinutes} mins`,
  };
}

@Injectable()
export class ParcelDraftsService {
  constructor(
    private readonly repository: ParcelDraftsRepository,
    private readonly customerNotificationsService: CustomerNotificationsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async estimateRoute(user: SessionPayload, body: Record<string, unknown>) {
    if (!user?.userId) {
      throw new BadRequestException("Authenticated user is required.");
    }

    const pickupAddress = asNonEmptyString(
      (body.pickupLocation as { address?: unknown } | undefined)?.address,
    );
    const deliveryAddress = asNonEmptyString(
      (body.deliveryLocation as { address?: unknown } | undefined)?.address,
    );

    if (!pickupAddress || !deliveryAddress) {
      throw new BadRequestException("Pickup and delivery locations are required.");
    }

    const estimate = createRouteEstimate(pickupAddress, deliveryAddress);

    return {
      pickupAddress,
      deliveryAddress,
      ...estimate,
    };
  }

  async getAvailableHubs(user: SessionPayload) {
    if (!user?.userId) {
      throw new BadRequestException("Authenticated user is required.");
    }

    return {
      hubs: AVAILABLE_HUBS,
    };
  }

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

    const estimate = createRouteEstimate(pickupAddress, deliveryAddress);
    const savedDistance = asNonEmptyString(body.distance) ?? estimate.distanceText;
    const savedDuration = asNonEmptyString(body.duration) ?? estimate.durationText;

    const { data, error } = await this.repository.saveStepOneDraft(draftId, user.userId, {
      pickup_address: pickupAddress,
      pickup_details: asNonEmptyString(
        (body.pickupLocation as { details?: unknown } | undefined)?.details,
      ),
      delivery_address: deliveryAddress,
      delivery_details: asNonEmptyString(
        (body.deliveryLocation as { details?: unknown } | undefined)?.details,
      ),
      distance_text: savedDistance,
      duration_text: savedDuration,
      step_completed: 1,
      status: "draft",
    });

    if (error || !data) {
      throw new InternalServerErrorException(
        draftId ? "Unable to update parcel draft." : "Unable to create parcel draft.",
      );
    }

    return {
      draftId: data.id,
      distance: savedDistance,
      duration: savedDuration,
      distanceKm: estimate.distanceKm,
      durationMinutes: estimate.durationMinutes,
    };
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
        trackingNumber: data.tracking_number,
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

    const trackingNumber = ownedDraft.data.tracking_number || createTrackingNumber();

    const updateResult = await this.repository.updateOwnedDraftState(draftId, user.userId, {
      step_completed: 5,
      status: "submitted",
      tracking_number: trackingNumber,
      sender_name: senderName,
      sender_phone: senderPhone,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
    });
    if (
      updateResult.error ||
      !updateResult.data ||
      updateResult.data.tracking_number !== trackingNumber
    ) {
      throw new InternalServerErrorException("Unable to complete booking right now.");
    }
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

  async getTrackingDetails(user: SessionPayload, trackingNumber: string) {
    const { data, error } = await this.repository.findOwnedSubmittedDraftByTrackingNumber(
      user.userId,
      trackingNumber.trim(),
    );

    if (error || !data) {
      throw new NotFoundException("Parcel not found for that tracking number.");
    }

    const createdTime = new Date(data.created_at);
    const updatedTime = new Date(data.updated_at);

    return {
      trackingNumber: data.tracking_number,
      status:
        data.status === "submitted" ? "Booking Confirmed" : data.status,
      origin: data.pickup_address,
      destination: data.delivery_address,
      estimatedDelivery: data.duration_text || "Calculating...",
      distance: data.distance_text || "Calculating...",
      driver: {
        name: "Assigning driver",
        phone: "Unavailable",
        vehicleType: "Pending dispatch",
        plateNumber: "TBD",
      },
      timeline: [
        {
          status: "Booking Confirmed",
          location: data.pickup_address,
          timestamp: createdTime.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          completed: true,
        },
        {
          status: "Preparing for Pickup",
          location: data.pickup_address,
          timestamp: updatedTime.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          completed: data.status === "submitted",
        },
        {
          status: "In Transit",
          location: data.delivery_address,
          timestamp: "Pending",
          completed: false,
        },
        {
          status: "Delivered",
          location: data.delivery_address,
          timestamp: "Pending",
          completed: false,
        },
      ],
    };
  }

  async getHistory(user: SessionPayload) {
    const { data, error } = await this.repository.listOwnedHistory(user.userId);

    if (error) {
      throw new InternalServerErrorException("Unable to load parcel history right now.");
    }

    return {
      transactions: (data ?? []).map((draft) => {
        const items = draft.parcel_draft_items ?? [];
        const totalParcels = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        const historyStatus = getHistoryStatus(draft.status);

        return {
          id: draft.tracking_number || draft.id,
          draftId: draft.id,
          trackingNumber: draft.tracking_number,
          date: formatHistoryDate(draft.created_at),
          createdAt: draft.created_at,
          from: draft.pickup_address,
          to: draft.delivery_address,
          status: historyStatus.label,
          rawStatus: draft.status,
          type: getHistoryType(items),
          isLive: historyStatus.isLive,
          bucket: historyStatus.bucket,
          amount: null,
          distance: draft.distance_text,
          duration: draft.duration_text,
          totalParcels,
        };
      }),
    };
  }

  async getHistoryDetails(user: SessionPayload, trackingNumber: string) {
    const { data, error } = await this.repository.findOwnedHistoryByTrackingNumber(
      user.userId,
      trackingNumber.trim(),
    );

    if (error || !data) {
      throw new NotFoundException("Parcel history record not found.");
    }

    const items = data.parcel_draft_items ?? [];
    const totalParcels = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    const firstItem = items[0];
    const historyStatus = getHistoryStatus(data.status);

    return {
      transaction: {
        id: data.tracking_number || data.id,
        trackingNumber: data.tracking_number,
        date: formatHistoryDate(data.created_at),
        createdAt: data.created_at,
        from: data.pickup_address,
        to: data.delivery_address,
        status: historyStatus.label,
        rawStatus: data.status,
        type: getHistoryType(items),
        isLive: historyStatus.isLive,
        amount: null,
        distance: data.distance_text,
        duration: data.duration_text,
        totalParcels,
      },
      details: {
        sender: {
          name: data.sender_name || "Not available",
          phone: data.sender_phone || "Not available",
          address: data.pickup_address,
        },
        receiver: {
          name: data.receiver_name || "Not available",
          phone: data.receiver_phone || "Not available",
          address: data.delivery_address,
        },
        parcel: {
          weight: firstItem?.weight_text || "Not available",
          dimensions: "Not stored yet",
          description:
            items.length > 0
              ? items
                  .map((item) => `${item.item_type || "Parcel"} x${item.quantity ?? 1}`)
                  .join(", ")
              : "No parcel items found",
          specialInstructions:
            firstItem?.delivery_guarantee
              ? `${firstItem.delivery_guarantee} handling`
              : "Standard handling",
          totalParcels,
        },
        driver: historyStatus.isLive
          ? {
              name: "Assigning driver",
              phone: "Unavailable",
              vehicle: "Pending dispatch",
              rating: null,
            }
          : null,
        timeline: [
          {
            status: "Booking Created",
            time: formatHistoryDate(data.created_at),
            location: data.pickup_address,
            completed: true,
          },
          {
            status: historyStatus.label,
            time: formatHistoryDate(data.updated_at),
            location: data.delivery_address,
            completed: true,
          },
        ],
      },
    };
  }
}
