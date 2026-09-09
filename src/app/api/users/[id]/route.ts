import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/apiError";

const PROFILE_FIELDS = ["name", "phone", "notifyEmail", "notifyWhatsapp"] as const;
const PM_ONLY_FIELDS = ["role", "discipline"] as const;

// PATCH /api/users/[id] — a user editing their own profile/notification prefs,
// or a PM editing anyone's role/discipline/profile (team management).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requester = await requireUser();
    const isSelf = requester.id === params.id;
    const isPM = requester.role === "PM";
    if (!isSelf && !isPM) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const data: Record<string, unknown> = {};
    for (const field of PROFILE_FIELDS) {
      if (field in body) data[field] = body[field];
    }
    if (isPM) {
      for (const field of PM_ONLY_FIELDS) {
        if (field in body) data[field] = body[field];
      }
    }
    if (data.role !== undefined && data.role !== "PM" && data.role !== "ENGINEER") {
      return NextResponse.json({ error: "role must be PM or ENGINEER" }, { status: 400 });
    }
    if (data.discipline !== undefined && !["MECHANICAL", "FIRE_SAFETY", "ALL"].includes(data.discipline as string)) {
      return NextResponse.json({ error: "invalid discipline" }, { status: 400 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const user = await prisma.user.update({ where: { id: params.id }, data });
    return NextResponse.json({ user });
  } catch (err) {
    return handleError(err);
  }
}
