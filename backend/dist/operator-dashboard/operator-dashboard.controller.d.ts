import type { Request } from "express";
import { OperatorDashboardService } from "./operator-dashboard.service";
export declare class OperatorDashboardController {
    private readonly operatorDashboardService;
    constructor(operatorDashboardService: OperatorDashboardService);
    getDashboard(request: Request): Promise<{
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
