import { Module } from "@nestjs/common";
import { ParcelDraftsController } from "./parcel-drafts.controller";
import { ParcelDraftsRepository } from "./parcel-drafts.repository";
import { ParcelDraftsService } from "./parcel-drafts.service";

@Module({
  controllers: [ParcelDraftsController],
  providers: [ParcelDraftsRepository, ParcelDraftsService],
})
export class ParcelDraftsModule {}
