import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import type { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { SessionAuthGuard } from "../common/session/session-auth.guard";
import type { SessionPayload } from "../common/session/session.types";
import { CustomerProfileService } from "./customer-profile.service";

function getSessionUser(request: Request) {
  return (request as Request & { user: SessionPayload }).user;
}

@Controller("customer/profile")
@UseGuards(SessionAuthGuard)
export class CustomerProfileController {
  constructor(private readonly customerProfileService: CustomerProfileService) {}

  @Get()
  getProfile(@Req() request: Request) {
    return this.customerProfileService.getCustomerProfile(getSessionUser(request));
  }

  @Patch()
  updateProfile(@Req() request: Request, @Body() body: Record<string, unknown>) {
    return this.customerProfileService.updateCustomerProfile(getSessionUser(request), {
      fullName: body.fullName ? String(body.fullName) : undefined,
      email: body.email ? String(body.email) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      address: body.address ? String(body.address) : undefined,
      dob: body.dob !== undefined ? String(body.dob ?? "") : undefined,
      preferences:
        typeof body.preferences === "object" && body.preferences
          ? (body.preferences as Record<string, boolean>)
          : undefined,
    });
  }

  @Post("upload-avatar")
  @UseInterceptors(FileInterceptor("file"))
  uploadAvatar(
    @Req() request: Request,
    @UploadedFile() file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    return this.customerProfileService.uploadProfilePicture(getSessionUser(request), file);
  }

  @Post("upload-discount-id")
  @UseInterceptors(FileInterceptor("file"))
  uploadDiscountId(
    @Req() request: Request,
    @UploadedFile() file?: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    return this.customerProfileService.uploadDiscountId(getSessionUser(request), file);
  }

  @Post("change-password")
  changePassword(@Req() request: Request, @Body() body: Record<string, unknown>) {
    return this.customerProfileService.changePassword(
      getSessionUser(request),
      String(body.currentPassword ?? ""),
      String(body.newPassword ?? ""),
    );
  }

  @Post("two-factor/setup")
  setupTwoFactor(@Req() request: Request) {
    return this.customerProfileService.createTwoFactorSetup(getSessionUser(request));
  }

  @Post("two-factor/enable")
  enableTwoFactor(@Req() request: Request, @Body() body: Record<string, unknown>) {
    return this.customerProfileService.enableTwoFactor(
      getSessionUser(request),
      String(body.code ?? ""),
    );
  }

  @Post("two-factor/disable")
  disableTwoFactor(@Req() request: Request, @Body() body: Record<string, unknown>) {
    return this.customerProfileService.disableTwoFactor(
      getSessionUser(request),
      String(body.code ?? ""),
    );
  }
}
