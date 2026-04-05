import type { SessionPayload } from "../common/session/session.types";
type TwoFactorChallengePayload = SessionPayload & {
    exp: number;
};
export declare function generateTwoFactorSecret(): string;
export declare function buildOtpAuthUri(secret: string, email: string, issuer?: string): string;
export declare function verifyTotpToken(secret: string, token: string, window?: number): boolean;
export declare function createTwoFactorChallengeToken(payload: SessionPayload): string;
export declare function readTwoFactorChallengeToken(token?: string | null): TwoFactorChallengePayload;
export {};
