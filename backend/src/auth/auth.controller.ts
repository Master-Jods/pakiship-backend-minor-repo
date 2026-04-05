import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  createSessionToken,
  getSessionCookieOptions,
  parseCookieHeader,
  readSessionToken,
  SESSION_COOKIE,
} from "../common/session/session.util";
import type { UserRole } from "../common/session/session.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const role = body.role as UserRole;
    const identifier = String(body.identifier ?? "");
    const password = String(body.password ?? "");

    if (!role || !identifier || !password) {
      throw new BadRequestException("Role, identifier, and password are required.");
    }

    const result = await this.authService.signIn(identifier, password, role);
    const requiresTwoFactor = "requiresTwoFactor" in result && result.requiresTwoFactor;

    if (!requiresTwoFactor) {
      response.cookie(
        SESSION_COOKIE,
        createSessionToken(result.session),
        getSessionCookieOptions(),
      );
    }

    return {
      user: result.user,
      redirectPath: result.redirectPath,
      requiresTwoFactor,
      challengeToken:
        requiresTwoFactor && "challengeToken" in result ? result.challengeToken : undefined,
    };
  }

  @Post("login/verify-2fa")
  async verifyTwoFactor(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const challengeToken = String(body.challengeToken ?? "");
    const code = String(body.code ?? "");

    if (!challengeToken || !code) {
      throw new BadRequestException("Challenge token and verification code are required.");
    }

    const result = await this.authService.verifyTwoFactorLogin(challengeToken, code);
    response.cookie(
      SESSION_COOKIE,
      createSessionToken(result.session),
      getSessionCookieOptions(),
    );

    return {
      user: result.user,
      redirectPath: result.redirectPath,
    };
  }

  @Post("signup")
  async signup(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "dob",
      "password",
      "role",
      "address",
      "city",
      "province",
    ] as const;

    for (const field of requiredFields) {
      if (!body[field]) {
        throw new BadRequestException(`Missing required field: ${field}`);
      }
    }

    const result = await this.authService.createUser({
      fullName: String(body.fullName),
      email: String(body.email),
      phone: String(body.phone),
      dob: String(body.dob),
      password: String(body.password),
      role: body.role as UserRole,
      address: String(body.address),
      city: String(body.city),
      province: String(body.province),
      documents: Array.isArray(body.documents)
        ? body.documents.map((item) => String(item))
        : [],
    });

    response.cookie(
      SESSION_COOKIE,
      createSessionToken(result.session),
      getSessionCookieOptions(),
    );

    return {
      user: result.user,
      redirectPath: result.redirectPath,
    };
  }

  @Get("session")
  getSession(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const cookies = parseCookieHeader(request.headers.cookie);
    const session = readSessionToken(cookies[SESSION_COOKIE]);

    if (!session) {
      response.status(401);
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: session,
    };
  }
}
