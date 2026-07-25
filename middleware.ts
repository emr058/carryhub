import { updateSession } from "@/lib/supabase-middleware";
import { NextResponse } from "next/server";

// Public routes — no auth required (NOT logged-in users)
const publicRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/forgot-password",
];

// Role-based route prefixes — each role can ONLY access these
const roleRouteMap: Record<string, string[]> = {
  COMPANY: ["/company"],
  COURIER: ["/courier"],
  ADMIN: ["/ops"],
};

// Landing page is public ONLY for unauthenticated users
const landingPage = "/";

export async function middleware(request: Request) {
  const { supabaseResponse, user } = await updateSession(request as any);

  const pathname = new URL(request.url).pathname;

  // Allow static files, Next.js internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  // Allow public routes (auth pages) for everyone
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // ----- AUTHENTICATED USER -----
  if (user) {
    // Fetch user role from our API
    try {
      const res = await fetch(
        new URL("/api/auth/role", request.url).toString(),
        { headers: { Cookie: request.headers.get("cookie") || "" } }
      );
      if (res.ok) {
        const { role } = await res.json();
        const allowedPaths = roleRouteMap[role] || [];

        // Logged-in user on landing page → redirect to their portal
        if (pathname === landingPage) {
          const portal = allowedPaths.length > 0 ? allowedPaths[0] : "/";
          return NextResponse.redirect(new URL(portal, request.url));
        }

        // Check if current path is allowed for this role
        const isAllowed = allowedPaths.some((prefix) =>
          pathname.startsWith(prefix)
        );

        if (!isAllowed) {
          // Blocked! Redirect to their portal
          const redirectTo =
            allowedPaths.length > 0 ? allowedPaths[0] : "/";
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      }
    } catch (e) {
      console.warn("[middleware] Role check failed, allowing", user.email, e);
    }

    return supabaseResponse;
  }

  // ----- UNAUTHENTICATED USER -----
  // Landing page is fine
  if (pathname === landingPage) {
    return supabaseResponse;
  }

  // Any other route → redirect to login
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
