import { Module } from "@nestjs/common";
import { CustomerNotificationsModule } from "./customer-notifications/customer-notifications.module";
import { AuthModule } from "./auth/auth.module";
import { CustomerProfileModule } from "./customer-profile/customer-profile.module";
import { ParcelDraftsModule } from "./parcel-drafts/parcel-drafts.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { CustomerDashboardModule } from "./customer-dashboard/customer-dashboard.module";

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    CustomerNotificationsModule,
    CustomerProfileModule,
    ParcelDraftsModule,
    CustomerDashboardModule,
  ],
})
export class AppModule {}
