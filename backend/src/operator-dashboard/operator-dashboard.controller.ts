import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { SessionAuthGuard } from "../common/session/session-auth.guard";
import type { SessionPayload } from "../common/session/session.types";
import { OperatorDashboardService } from "./operator-dashboard.service";

function getSessionUser(request: Request) {
  return (request as Request & { user: SessionPayload }).user;
}

@Controller("operator/dashboard")
@UseGuards(SessionAuthGuard)
export class OperatorDashboardController {
  constructor(private readonly operatorDashboardService: OperatorDashboardService) {}

  @Get()
  getDashboard(@Req() request: Request) {
    return this.operatorDashboardService.getDashboard(getSessionUser(request));
  }

  @Get("relay-bookings")
  getRelayBookings(@Req() request: Request) {
    return this.operatorDashboardService.getRelayBookings(getSessionUser(request));
  }

  @Patch("relay-bookings/:draftId/status")
  updateRelayBookingStatus(
    @Req() request: Request,
    @Param("draftId") draftId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.operatorDashboardService.updateRelayBookingStatus(
      getSessionUser(request),
      draftId,
      {
        currentLocation: body.currentLocation,
        progressLabel: body.progressLabel,
        progressPercentage: body.progressPercentage,
      },
    );
  }
}
