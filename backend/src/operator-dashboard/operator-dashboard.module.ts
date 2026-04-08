import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { OperatorDashboardController } from "./operator-dashboard.controller";
import { OperatorDashboardService } from "./operator-dashboard.service";

@Module({
  imports: [SupabaseModule],
  controllers: [OperatorDashboardController],
  providers: [OperatorDashboardService],
})
export class OperatorDashboardModule {}
