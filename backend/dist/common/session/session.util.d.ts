import type { SessionPayload } from "./session.types";
export declare const SESSION_COOKIE = "pakiship_session";
export declare function createSessionToken(payload: SessionPayload): string;
export declare function readSessionToken(token?: string | null): SessionPayload;
export declare function getSessionCookieOptions(keepLoggedIn?: boolean): {
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    maxAge: number;
    path: string;
};
export declare function parseCookieHeader(cookieHeader?: string | null): Record<string, string>;
