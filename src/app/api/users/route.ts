import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePM } from "@/lib/auth";
import { handleError } from "@/lib/apiError";

// GET /api/users — team roster (PM only), with each engineer's current pending load.
export async function GET() {
  try {
    await requirePM();
    const users = await prisma.user.findMany({
      include: { _count: { select: { reviewsAssigned: { where: { status: "PENDING" } } } } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ users });
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/users — add a teammate (PM only). No password: this app uses
// passwordless email login, so creating the account is enough for them to sign in.
export async function POST(req: NextRequest) {
  try {
    await requirePM();
    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const phone = body?.phone?.trim() || null;
    const role = body?.role;
    const discipline = body?.discipline ?? "ALL";

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }
    if (role !== "PM" && role !== "ENGINEER") {
      return NextResponse.json({ error: "role must be PM or ENGINEER" }, { status: 400 });
    }
    if (!["MECHANICAL", "FIRE_SAFETY", "ALL"].includes(discipline)) {
      return NextResponse.json({ error: "invalid discipline" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({ data: { name, email, phone, role, discipline } });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
