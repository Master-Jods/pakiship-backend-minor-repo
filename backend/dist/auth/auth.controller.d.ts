import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { UserRole } from "../common/session/session.types";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: Record<string, unknown>, response: Response): Promise<{
        user: {
            id: any;
            fullName: any;
            role: UserRole;
        };
        redirectPath: string;
    }>;
    signup(body: Record<string, unknown>, response: Response): Promise<{
        user: {
            id: string;
            fullName: string;
            role: UserRole;
        };
        redirectPath: string;
    }>;
    getSession(request: Request, response: Response): {
        authenticated: boolean;
        user?: undefined;
    } | {
        authenticated: boolean;
        user: import("../common/session/session.types").SessionPayload;
    };
}
