import type { SessionPayload } from "../common/session/session.types";
import { SupabaseService } from "../supabase/supabase.service";
export declare class OperatorDashboardService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
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
}
