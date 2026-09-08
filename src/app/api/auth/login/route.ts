import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

// Passwordless dev-style login: look the user up by email (seeded users only).
// Swap for a real credential/OTP/SSO flow before going to production.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No account found for that email" }, { status: 404 });
  }

  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
}
