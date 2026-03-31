"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function normalizePhone(phone) {
    return phone.replace(/\D/g, "").slice(-10);
}
function getRedirectPath(role) {
    if (role === "driver")
        return "/driver/home";
    if (role === "operator")
        return "/operator/home";
    return "/customer/home";
}
let AuthService = class AuthService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createUser(input) {
        const admin = this.supabaseService.createAdminClient();
        const email = normalizeEmail(input.email);
        const phone = normalizePhone(input.phone);
        const { data: duplicateProfiles, error: duplicateError } = await admin
            .from("profiles")
            .select("id")
            .or(`email.eq.${email},phone.eq.${phone}`)
            .limit(1);
        if (duplicateError) {
            throw new common_1.InternalServerErrorException("Unable to validate account uniqueness.");
        }
        if (duplicateProfiles && duplicateProfiles.length > 0) {
            throw new common_1.ConflictException("An account with that email or mobile number already exists.");
        }
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email,
            password: input.password,
            email_confirm: true,
            user_metadata: {
                full_name: input.fullName.trim(),
                role: input.role,
            },
        });
        if (authError || !authData.user) {
            throw new common_1.BadRequestException(authError?.message || "Unable to create auth account.");
        }
        const profile = {
            id: authData.user.id,
            fullName: input.fullName.trim(),
            email,
            phone,
            dob: input.dob,
            role: input.role,
            address: input.address.trim(),
            city: input.city.trim(),
            province: input.province.trim(),
            documents: input.documents ?? [],
            createdAt: new Date().toISOString(),
        };
        const { error: profileError } = await admin.from("profiles").insert({
            id: profile.id,
            full_name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            dob: profile.dob,
            role: profile.role,
            address: profile.address,
            city: profile.city,
            province: profile.province,
            documents: profile.documents,
            created_at: profile.createdAt,
        });
        if (profileError) {
            await admin.auth.admin.deleteUser(profile.id);
            throw new common_1.InternalServerErrorException("Account was created but the profile could not be saved.");
        }
        return {
            user: {
                id: profile.id,
                fullName: profile.fullName,
                role: profile.role,
            },
            redirectPath: getRedirectPath(profile.role),
            session: {
                userId: profile.id,
                role: profile.role,
                fullName: profile.fullName,
            },
        };
    }
    async signIn(identifier, password, role) {
        const admin = this.supabaseService.createAdminClient();
        const supabase = this.supabaseService.createServerClient();
        const normalizedIdentifier = identifier.includes("@")
            ? normalizeEmail(identifier)
            : normalizePhone(identifier);
        const identifierColumn = identifier.includes("@") ? "email" : "phone";
        const { data: profileRow, error: profileError } = await admin
            .from("profiles")
            .select("id, full_name, email, phone, role")
            .eq(identifierColumn, normalizedIdentifier)
            .eq("role", role)
            .maybeSingle();
        if (profileError || !profileRow) {
            throw new common_1.UnauthorizedException("Invalid credentials for the selected role.");
        }
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: profileRow.email,
            password,
        });
        if (authError || !authData.user) {
            throw new common_1.UnauthorizedException("Invalid credentials for the selected role.");
        }
        return {
            user: {
                id: profileRow.id,
                fullName: profileRow.full_name,
                role: profileRow.role,
            },
            redirectPath: getRedirectPath(profileRow.role),
            session: {
                userId: profileRow.id,
                role: profileRow.role,
                fullName: profileRow.full_name,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
