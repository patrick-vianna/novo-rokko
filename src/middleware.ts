import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Detect subdomain
  let subdomain = "";
  if (hostname.includes("rokko.rustontools.tech")) {
    const parts = hostname.split(".");
    if (parts.length >= 4) subdomain = parts[0];
  }
  if (!subdomain && hostname.includes("localhost")) {
    subdomain = searchParams.get("subdomain") || "";
  }

  // Public routes
  const publicRoutes = ["/login", "/api/auth"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next();
    response.headers.set("x-subdomain", subdomain);
    return response;
  }

  // Auth cookie (dev: plain name, prod HTTPS: __Secure- prefix)
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // API routes return 401 JSON instead of redirect
  if (pathname.startsWith("/api/")) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    const response = NextResponse.next();
    response.headers.set("x-subdomain", subdomain);
    return response;
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-subdomain", subdomain);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
