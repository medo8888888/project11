import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/approve", "/api/auth/login", "/api/auth/me", "/api/magic-link", "/api/cron"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/reviews/"); // token-authorized per-review actions handle their own auth

  const hasSession = req.cookies.has("sla_session");

  if (!isPublic && !hasSession && pathname !== "/") {
    const next = `${pathname}${req.nextUrl.search}`;
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
