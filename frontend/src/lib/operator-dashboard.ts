import { apiFetch } from "@/lib/api-client";

export type OperatorDashboardResponse = {
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
};

export async function fetchOperatorDashboard() {
  const response = await apiFetch("/api/operator/dashboard");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to load operator dashboard.");
  }

  return result as OperatorDashboardResponse;
}
