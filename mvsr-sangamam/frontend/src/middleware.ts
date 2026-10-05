import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./utils/session";

/**
 * Edge gate for page routes (fast redirect).
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const toLogin = () => {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  };
  if (!session) return toLogin();
  if (pathname.startsWith("/admin") && session.role !== "ADMIN" && session.role !== "ORGANIZER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/register/:path*", "/registration/:path*"],
};
