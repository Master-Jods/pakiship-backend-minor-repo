import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import type { SessionPayload } from "../common/session/session.types";
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

@Injectable()
export class OperatorDashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
}
