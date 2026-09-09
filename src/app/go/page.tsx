import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProjectCode, formatProjectCode } from "@/lib/labels";
import { SearchX, ClipboardCheck } from "lucide-react";

/**
 * Universal "jump to a project by its code" entry point — /go?code=P000042.
 * This is what the Navbar quick-search, the browser extension's popup and
 * context-menu action, and any emailed reference number all resolve
 * through, so there's exactly one place that turns a human code into a
 * project and redirects (or explains why it can't).
 */
export default async function GoPage({ searchParams }: { searchParams: { code?: string } }) {
  const rawCode = searchParams.code ?? "";

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/go?code=${rawCode}`)}`);

  const seq = parseProjectCode(rawCode);
  if (!seq) return <GoError code={rawCode} reason="invalid" />;

  const project = await prisma.project.findUnique({ where: { seq }, select: { id: true } });
  if (!project) return <GoError code={formatProjectCode(seq)} reason="not_found" />;

  redirect(`/projects/${project.id}`);
}

function GoError({ code, reason }: { code: string; reason: "invalid" | "not_found" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-light bg-gray-50 px-4">
      <div className="card flex w-full max-w-sm flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
          <ClipboardCheck size={15} />
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <SearchX size={22} />
        </span>
        <p className="text-sm font-medium text-gray-900">
          {reason === "invalid" ? "That doesn't look like a project code" : `No project found for ${code}`}
        </p>
        <p className="text-xs text-gray-400">
          {reason === "invalid"
            ? `"${code || "(empty)"}" isn't a code like P000042.`
            : "Double-check the code — it may belong to a different account, or the project may have been removed."}
        </p>
        <a href="/dashboard" className="btn-secondary mt-1">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
