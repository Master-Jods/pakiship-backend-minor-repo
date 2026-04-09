import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { SessionPayload, UserRole } from "../common/session/session.types";

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-11);
}

function getRedirectPath(role: UserRole) {
  if (role === "driver") return "/driver/home";
  if (role === "operator") return "/operator/home";
  return "/customer/home";
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(input: SignupInput) {
    const admin = this.supabaseService.createAdminClient();
    const email = normalizeEmail(input.email);
    const phone = normalizePhone(input.phone);

    const { data: duplicateProfiles, error: duplicateError } = await admin
      .from("profiles")
      .select("id")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(1);

    if (duplicateError) {
      throw new InternalServerErrorException("Unable to validate account uniqueness.");
    }

    if (duplicateProfiles && duplicateProfiles.length > 0) {
      throw new ConflictException("An account with that email or mobile number already exists.");
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
      throw new BadRequestException(authError?.message || "Unable to create auth account.");
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
      throw new InternalServerErrorException(
        "Account was created but the profile could not be saved.",
      );
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
      } satisfies SessionPayload,
    };
  }

  async signIn(identifier: string, password: string, role: UserRole) {
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
      throw new UnauthorizedException("Invalid credentials for the selected role.");
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: profileRow.email,
      password,
    });

    if (authError || !authData.user) {
      throw new UnauthorizedException("Invalid credentials for the selected role.");
    }

    return {
      user: {
        id: profileRow.id,
        fullName: profileRow.full_name,
        role: profileRow.role as UserRole,
      },
      redirectPath: getRedirectPath(profileRow.role as UserRole),
      session: {
        userId: profileRow.id,
        role: profileRow.role as UserRole,
        fullName: profileRow.full_name,
      } satisfies SessionPayload,
    };
  }
}
