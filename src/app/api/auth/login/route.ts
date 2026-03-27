import { NextResponse } from "next/server";
import { signInWithSupabase } from "@/lib/auth-supabase";
import { setSessionCookie } from "@/lib/auth-session";
import type { UserRole } from "@/lib/auth-types";
import { getRedirectPath } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role as UserRole;
    const identifier = String(body.identifier ?? "");
    const password = String(body.password ?? "");

    if (!role || !identifier || !password) {
      return NextResponse.json(
        { message: "Role, identifier, and password are required." },
        { status: 400 },
      );
    }

    const result = await signInWithSupabase(identifier, password, role);
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status },
      );
    }

    await setSessionCookie({
      userId: result.profile.id,
      role: result.profile.role,
      fullName: result.profile.fullName,
    });

    return NextResponse.json({
      user: {
        id: result.profile.id,
        fullName: result.profile.fullName,
        role: result.profile.role,
      },
      redirectPath: getRedirectPath(result.profile.role),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to log in right now." },
      { status: 500 },
    );
  }
}
