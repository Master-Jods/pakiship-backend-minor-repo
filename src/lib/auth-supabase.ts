import type { UserProfile, UserRole } from "@/lib/auth-types";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeEmail, normalizePhone } from "@/lib/auth-utils";

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

export async function createSupabaseUser(input: SignupInput) {
  const admin = createSupabaseAdminClient();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  const { data: duplicateProfiles, error: duplicateError } = await admin
    .from("profiles")
    .select("id")
    .or(`email.eq.${email},phone.eq.${phone}`)
    .limit(1);

  if (duplicateError) {
    return {
      ok: false as const,
      status: 500,
      message: "Unable to validate account uniqueness.",
    };
  }

  if (duplicateProfiles && duplicateProfiles.length > 0) {
    return {
      ok: false as const,
      status: 409,
      message: "An account with that email or mobile number already exists.",
    };
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
    return {
      ok: false as const,
      status: 400,
      message: authError?.message || "Unable to create auth account.",
    };
  }

  const profile: UserProfile = {
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
    return {
      ok: false as const,
      status: 500,
      message: "Account was created but the profile could not be saved.",
    };
  }

  return {
    ok: true as const,
    profile,
  };
}

export async function signInWithSupabase(identifier: string, password: string, role: UserRole) {
  const admin = createSupabaseAdminClient();
  const supabase = createSupabaseServerClient();

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
    return {
      ok: false as const,
      status: 401,
      message: "Invalid credentials for the selected role.",
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: profileRow.email,
    password,
  });

  if (authError || !authData.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Invalid credentials for the selected role.",
    };
  }

  return {
    ok: true as const,
    profile: {
      id: profileRow.id,
      fullName: profileRow.full_name,
      email: profileRow.email,
      phone: profileRow.phone,
      role: profileRow.role as UserRole,
    },
  };
}
