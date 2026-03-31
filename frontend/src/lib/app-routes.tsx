"use client";

import { HomePage } from "@/features/pages/HomePage";
import { SignUpPage } from "@/features/pages/SignUpPage";
import { LoginPage } from "@/features/pages/LoginPage";
import { CustomerHomePage } from "@/features/pages/CustomerHomePage";
import { DriverHomePage } from "@/features/pages/DriverHomePage";
import { OperatorHomePage } from "@/features/pages/OperatorHomePage";
import { SendParcelPage } from "@/features/pages/SendParcelPage";
import { TrackPackagePage } from "@/features/pages/TrackPackagePage";
import { HistoryPage } from "@/features/pages/HistoryPage";
import { RateReviewPage } from "@/features/pages/RateReviewPage";
import { AllDeliveriesPage } from "@/features/pages/AllDeliveriesPage";
import { EditProfilePage } from "@/features/pages/EditProfilePage";
import { DriverProfilePage } from "@/features/pages/DriverProfilePage";
import { OperatorProfilePage } from "@/features/pages/OperatorProfilePage";
import { CustomerSettingsPage } from "@/features/pages/CustomerSettingsPage";
import { DriverSettingsPage } from "@/features/pages/DriverSettingsPage";
import { OperatorSettingsPage } from "@/features/pages/OperatorSettingsPage";
import JobDetailsPage from "@/features/pages/JobDetailsPage";
import UpdateParcelStatusPage from "@/features/pages/UpdateParcelStatusPage";
import { ReceiveParcelPage } from "@/features/pages/ReceiveParcelPage";
import { NotFoundPage } from "@/features/pages/NotFoundPage";

type Match = {
  component: React.ComponentType;
  params: Record<string, string>;
};

type StaticRoute = {
  path: string;
  component: React.ComponentType;
};

type DynamicRoute = {
  pattern: RegExp;
  getParams: (match: RegExpExecArray) => Record<string, string>;
  component: React.ComponentType;
};

const staticRoutes: StaticRoute[] = [
  { path: "/", component: HomePage },
  { path: "/signup", component: SignUpPage },
  { path: "/login", component: LoginPage },
  { path: "/customer/home", component: CustomerHomePage },
  { path: "/customer/edit-profile", component: EditProfilePage },
  { path: "/customer/settings", component: CustomerSettingsPage },
  { path: "/customer/send-parcel", component: SendParcelPage },
  { path: "/customer/track-package", component: TrackPackagePage },
  { path: "/customer/history", component: HistoryPage },
  { path: "/customer/rate-review", component: RateReviewPage },
  { path: "/customer/all-deliveries", component: AllDeliveriesPage },
  { path: "/driver/home", component: DriverHomePage },
  { path: "/driver", component: DriverHomePage },
  { path: "/driver/profile", component: DriverProfilePage },
  { path: "/driver/settings", component: DriverSettingsPage },
  { path: "/operator/home", component: OperatorHomePage },
  { path: "/operator/profile", component: OperatorProfilePage },
  { path: "/operator/settings", component: OperatorSettingsPage },
  { path: "/operator/receive-parcel", component: ReceiveParcelPage },
];

const dynamicRoutes: DynamicRoute[] = [
  {
    pattern: /^\/customer\/transaction\/([^/]+)$/,
    getParams: (match) => ({ id: match[1] }),
    component: TrackPackagePage,
  },
  {
    pattern: /^\/driver\/job\/([^/]+)$/,
    getParams: (match) => ({ jobId: match[1] }),
    component: JobDetailsPage,
  },
  {
    pattern: /^\/driver\/job\/([^/]+)\/update-status$/,
    getParams: (match) => ({ jobId: match[1] }),
    component: UpdateParcelStatusPage,
  },
];

export function resolveRoute(pathname: string): Match {
  const staticMatch = staticRoutes.find((route) => route.path === pathname);
  if (staticMatch) {
    return { component: staticMatch.component, params: {} };
  }

  for (const route of dynamicRoutes) {
    const match = route.pattern.exec(pathname);
    if (match) {
      return {
        component: route.component,
        params: route.getParams(match),
      };
    }
  }

  return { component: NotFoundPage, params: {} };
}
