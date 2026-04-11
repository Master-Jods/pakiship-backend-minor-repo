import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { SessionPayload } from "../common/session/session.types";
import { CustomerNotificationsService } from "../customer-notifications/customer-notifications.service";
import { ParcelDraftsRepository } from "../parcel-drafts/parcel-drafts.repository";
import { SupabaseService } from "../supabase/supabase.service";

type HubAssignmentRow = {
  hub_id: string;
};

type ParcelHubRecordRow = {
  parcel_drafts?: {
    user_id?: string | null;
  } | null;
};

type MonetaryRow = {
  amount: number | string | null;
};

const PH_TIMEZONE_OFFSET_HOURS = 8;

function startOfPhilippineDay(now = new Date()) {
  const shifted = new Date(now.getTime() + PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
}

function startOfPhilippineWeek(now = new Date()) {
  const dayStart = startOfPhilippineDay(now);
  const shifted = new Date(dayStart.getTime() + PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  const dayOfWeek = shifted.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  shifted.setUTCDate(shifted.getUTCDate() - diffToMonday);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
}

function startOfPhilippineMonth(now = new Date()) {
  const shifted = new Date(now.getTime() + PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  shifted.setUTCDate(1);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
}

function sumAmounts(rows: MonetaryRow[] | null | undefined) {
  return (rows ?? []).reduce((total, row) => {
    const amount = Number(row.amount ?? 0);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function createEmptyDashboard(reason: string) {
  return {
    kpis: {
      incomingToday: 0,
      currentlyStored: 0,
      pickedUpToday: 0,
      customersServed: 0,
    },
    earnings: {
      totalEarned: 0,
      weeklyIncrease: 0,
      incentives: 0,
      bonusesEarned: 0,
    },
    meta: {
      currency: "PHP",
      timeframe: "month_to_date",
      derivedFrom: reason,
    },
  };
}

function formatRelayBookingRows(
  rows: Array<{
    id: string;
    tracking_number?: string | null;
    pickup_address?: string | null;
    delivery_address?: string | null;
    status?: string | null;
    created_at?: string | null;
    receiver_name?: string | null;
    service_id?: string | null;
    delivery_mode?: string | null;
    is_bulk?: boolean | null;
    drop_off_point_id?: string | null;
    drop_off_point_name?: string | null;
    drop_off_point_address?: string | null;
    tracking_current_location?: string | null;
    tracking_progress_label?: string | null;
    tracking_progress_percentage?: number | string | null;
    parcel_draft_items?: Array<{ quantity?: number | null; item_type?: string | null }> | null;
  }>,
) {
  return rows.map((row) => ({
    draftId: row.id,
    trackingNumber: row.tracking_number,
    pickupAddress: row.pickup_address,
    deliveryAddress: row.delivery_address,
    receiverName: row.receiver_name,
    status: row.status,
    serviceId: row.service_id,
    deliveryMode: row.delivery_mode,
    isBulk: Boolean(row.is_bulk),
    totalParcels: (row.parcel_draft_items ?? []).reduce(
      (sum, item) => sum + Number(item.quantity ?? 0),
      0,
    ),
    currentLocation: row.tracking_current_location || row.pickup_address,
    progressLabel: row.tracking_progress_label || "Awaiting operator processing",
    progressPercentage: Number(row.tracking_progress_percentage ?? 0),
    dropOffPoint: row.drop_off_point_id
      ? {
          id: row.drop_off_point_id,
          name: row.drop_off_point_name,
          address: row.drop_off_point_address,
        }
      : null,
    createdAt: row.created_at,
  }));
}

@Injectable()
export class OperatorDashboardService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly parcelDraftsRepository: ParcelDraftsRepository,
    private readonly customerNotificationsService: CustomerNotificationsService,
  ) {}

  private async findActiveHubId(operatorUserId: string) {
    const admin = this.supabaseService.createAdminClient();
    const { data, error } = await admin
      .from("operator_hub_assignments")
      .select("hub_id")
      .eq("operator_user_id", operatorUserId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle<HubAssignmentRow>();

    if (error) {
      throw new InternalServerErrorException("Unable to load operator dashboard metrics.");
    }

    return data?.hub_id ?? null;
  }

  private async loadKpiMetrics(hubId: string, dayStart: Date) {
    const admin = this.supabaseService.createAdminClient();
    const dayEnd = addDays(dayStart, 1);

    const [
      incomingTodayResult,
      currentlyStoredResult,
      pickedUpTodayResult,
      customersServedResult,
    ] = await Promise.all([
      admin
        .from("parcel_hub_records")
        .select("id", { count: "exact", head: true })
        .eq("hub_id", hubId)
        .gte("received_at", dayStart.toISOString())
        .lt("received_at", dayEnd.toISOString()),
      admin
        .from("parcel_hub_records")
        .select("id", { count: "exact", head: true })
        .eq("hub_id", hubId)
        .eq("status", "stored"),
      admin
        .from("parcel_hub_records")
        .select("id", { count: "exact", head: true })
        .eq("hub_id", hubId)
        .gte("picked_up_at", dayStart.toISOString())
        .lt("picked_up_at", dayEnd.toISOString()),
      admin
        .from("parcel_hub_records")
        .select("parcel_drafts!inner(user_id)")
        .eq("hub_id", hubId)
        .gte("received_at", dayStart.toISOString())
        .lt("received_at", dayEnd.toISOString()),
    ]);

    if (
      incomingTodayResult.error ||
      currentlyStoredResult.error ||
      pickedUpTodayResult.error ||
      customersServedResult.error
    ) {
      throw new InternalServerErrorException("Unable to load operator dashboard metrics.");
    }

    const customersServedRows = (customersServedResult.data ?? []) as ParcelHubRecordRow[];
    const customersServed = new Set(
      customersServedRows
        .map((row) => row.parcel_drafts?.user_id ?? null)
        .filter((value): value is string => Boolean(value)),
    ).size;

    return {
      incomingToday: incomingTodayResult.count ?? 0,
      currentlyStored: currentlyStoredResult.count ?? 0,
      pickedUpToday: pickedUpTodayResult.count ?? 0,
      customersServed,
    };
  }

  private async loadEarningsMetrics(
    operatorUserId: string,
    hubId: string,
    weekStart: Date,
    monthStart: Date,
  ) {
    const admin = this.supabaseService.createAdminClient();

    const [monthlyEarningsResult, weeklyEarningsResult, incentivesResult] = await Promise.all([
      admin
        .from("operator_earnings")
        .select("amount")
        .eq("operator_user_id", operatorUserId)
        .eq("hub_id", hubId)
        .gte("earned_at", monthStart.toISOString()),
      admin
        .from("operator_earnings")
        .select("amount")
        .eq("operator_user_id", operatorUserId)
        .eq("hub_id", hubId)
        .gte("earned_at", weekStart.toISOString()),
      admin
        .from("operator_incentives")
        .select("amount", { count: "exact" })
        .eq("operator_user_id", operatorUserId)
        .eq("hub_id", hubId)
        .gte("awarded_at", monthStart.toISOString()),
    ]);

    if (
      monthlyEarningsResult.error ||
      weeklyEarningsResult.error ||
      incentivesResult.error
    ) {
      throw new InternalServerErrorException("Unable to load operator dashboard metrics.");
    }

    return {
      totalEarned: sumAmounts(monthlyEarningsResult.data as MonetaryRow[] | null),
      weeklyIncrease: sumAmounts(weeklyEarningsResult.data as MonetaryRow[] | null),
      incentives: sumAmounts(incentivesResult.data as MonetaryRow[] | null),
      bonusesEarned: incentivesResult.count ?? 0,
    };
  }

  async getDashboard(session: SessionPayload) {
    if (session.role !== "operator") {
      throw new ForbiddenException("Only operators can access this dashboard.");
    }

    const now = new Date();
    const dayStart = startOfPhilippineDay(now);
    const weekStart = startOfPhilippineWeek(now);
    const monthStart = startOfPhilippineMonth(now);

    const hubId = await this.findActiveHubId(session.userId);
    if (!hubId) {
      return createEmptyDashboard("operator hub tables");
    }

    const [kpis, earnings] = await Promise.all([
      this.loadKpiMetrics(hubId, dayStart),
      this.loadEarningsMetrics(session.userId, hubId, weekStart, monthStart),
    ]);

    return {
      kpis,
      earnings,
      meta: {
        currency: "PHP",
        timeframe: "month_to_date",
        derivedFrom: "operator hub records and payout tables",
      },
    };
  }

  async getRelayBookings(session: SessionPayload) {
    if (session.role !== "operator") {
      throw new ForbiddenException("Only operators can access relay bookings.");
    }

    const hubId = await this.findActiveHubId(session.userId);
    const primaryResult = hubId
      ? await this.parcelDraftsRepository.listRelayBookingsForHub(hubId)
      : null;

    if (primaryResult?.error) {
      throw new InternalServerErrorException("Unable to load relay bookings.");
    }

    const matchedRows = primaryResult?.data ?? [];
    if (matchedRows.length > 0) {
      return {
        bookings: formatRelayBookingRows(matchedRows),
        meta: {
          hubId,
          matchedBy: "active_hub",
        },
      };
    }

    const fallbackResult = await this.parcelDraftsRepository.listRecentRelayBookings();
    if (fallbackResult.error) {
      throw new InternalServerErrorException("Unable to load relay bookings.");
    }

    return {
      bookings: formatRelayBookingRows(fallbackResult.data ?? []),
      meta: {
        hubId,
        matchedBy: hubId ? "fallback_recent_relay_bookings" : "no_active_hub_fallback",
      },
    };
  }

  async updateRelayBookingStatus(
    session: SessionPayload,
    draftId: string,
    input: {
      currentLocation?: unknown;
      progressLabel?: unknown;
      progressPercentage?: unknown;
    },
  ) {
    if (session.role !== "operator") {
      throw new ForbiddenException("Only operators can update relay bookings.");
    }

    const relayBooking = await this.parcelDraftsRepository.findRelayBookingById(draftId);
    if (relayBooking.error || !relayBooking.data) {
      throw new NotFoundException("Relay booking not found.");
    }

    const currentLocation = String(
      input.currentLocation ??
        relayBooking.data.tracking_current_location ??
        relayBooking.data.drop_off_point_id ??
        "Drop-off point",
    ).trim();
    const progressLabel = String(
      input.progressLabel ?? relayBooking.data.tracking_progress_label ?? "Parcel received at drop-off point",
    ).trim();
    const progressPercentage = Number(
      input.progressPercentage ?? relayBooking.data.tracking_progress_percentage ?? 50,
    );

    if (!currentLocation || !progressLabel) {
      throw new BadRequestException("Current location and progress label are required.");
    }

    if (!Number.isFinite(progressPercentage) || progressPercentage < 0 || progressPercentage > 100) {
      throw new BadRequestException("Progress percentage must be between 0 and 100.");
    }

    const updateResult = await this.parcelDraftsRepository.updateRelayBookingTracking(draftId, {
      tracking_current_location: currentLocation,
      tracking_progress_label: progressLabel,
      tracking_progress_percentage: progressPercentage,
    });

    if (updateResult.error || !updateResult.data) {
      throw new InternalServerErrorException("Unable to update relay booking status.");
    }

    await this.customerNotificationsService.createNotification(
      relayBooking.data.user_id,
      "delivery",
      "Parcel status updated",
      `${progressLabel}. Current location: ${currentLocation}.`,
    );

    return {
      draftId,
      trackingNumber: updateResult.data.tracking_number,
      currentLocation: updateResult.data.tracking_current_location,
      progressLabel: updateResult.data.tracking_progress_label,
      progressPercentage: Number(updateResult.data.tracking_progress_percentage ?? 0),
    };
  }
}
