import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ParcelDraftsModule } from "./parcel-drafts/parcel-drafts.module";
import { SupabaseModule } from "./supabase/supabase.module";

@Module({
  imports: [SupabaseModule, AuthModule, ParcelDraftsModule],
})
export class AppModule {}
