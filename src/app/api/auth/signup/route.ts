import { NextResponse } from "next/server";
import { createSupabaseUser } from "@/lib/auth-supabase";
import { setSessionCookie } from "@/lib/auth-session";
import { getRedirectPath } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const created = await createSupabaseUser({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      dob: body.dob,
      password: body.password,
      role: body.role,
      address: body.address,
      city: body.city,
      province: body.province,
      documents: Array.isArray(body.documents) ? body.documents : [],
    });

    if (!created.ok) {
      return NextResponse.json(
        { message: created.message },
        { status: created.status },
      );
    }

    await setSessionCookie({
      userId: created.profile.id,
      role: created.profile.role,
      fullName: created.profile.fullName,
    });

    return NextResponse.json({
      user: {
        id: created.profile.id,
        fullName: created.profile.fullName,
        role: created.profile.role,
      },
      redirectPath: getRedirectPath(created.profile.role),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to create account right now." },
      { status: 500 },
    );
  }
}
