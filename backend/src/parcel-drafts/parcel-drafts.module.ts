import { Module } from "@nestjs/common";
import { CustomerNotificationsModule } from "../customer-notifications/customer-notifications.module";
import { ParcelDraftsController } from "./parcel-drafts.controller";
import { ParcelDraftsRepository } from "./parcel-drafts.repository";
import { ParcelDraftsService } from "./parcel-drafts.service";

@Module({
  imports: [CustomerNotificationsModule],
  controllers: [ParcelDraftsController],
  providers: [ParcelDraftsRepository, ParcelDraftsService],
})
export class ParcelDraftsModule {}
