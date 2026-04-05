import { SupabaseService } from "../supabase/supabase.service";
import type { UserRole } from "../common/session/session.types";
type SignupInput = {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    password: string;
    role: UserRole;
    address: string;
    city: string;
    province: string;
    documents?: string[];
};
export declare class AuthService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    createUser(input: SignupInput): Promise<{
        user: {
            id: string;
            fullName: string;
            role: UserRole;
        };
        redirectPath: string;
        session: {
            userId: string;
            role: UserRole;
            fullName: string;
        };
    }>;
    signIn(identifier: string, password: string, role: UserRole): Promise<{
        requiresTwoFactor: true;
        challengeToken: string;
        user: {
            id: any;
            fullName: any;
            role: UserRole;
        };
        redirectPath: string;
        session?: undefined;
    } | {
        user: {
            id: any;
            fullName: any;
            role: UserRole;
        };
        redirectPath: string;
        session: {
            userId: any;
            role: UserRole;
            fullName: any;
        };
        requiresTwoFactor?: undefined;
        challengeToken?: undefined;
    }>;
    verifyTwoFactorLogin(challengeToken: string, code: string): Promise<{
        user: {
            id: string;
            fullName: string;
            role: UserRole;
        };
        redirectPath: string;
        session: {
            userId: string;
            fullName: string;
            role: UserRole;
        };
    }>;
}
export {};
