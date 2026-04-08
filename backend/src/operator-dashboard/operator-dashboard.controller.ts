import { Controller, Get, Req, UseGuards } from "@nestjs/common";
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
}
