import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ParcelDraftsModule } from "./parcel-drafts/parcel-drafts.module";
import { ProfileModule } from "./profile/profile.module";
import { SettingsModule } from "./settings/settings.module";
import { SupabaseModule } from "./supabase/supabase.module";

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    ParcelDraftsModule,
    ProfileModule,
    SettingsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
