import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
    "/login",
    "/signup",
    "/onboarding",
    "/privacy-policy",
    "/_next",
    "/favicon.ico",
    "/api",
];

const TOKEN_COOKIE = "access_token";

export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // Allow public paths (but NOT the root path "/")
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check for authentication token
    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    
    // No token = not authenticated = redirect to login
    if (!token) {
        console.log("[middleware] No token found, redirecting to login");
        const loginUrl = new URL("/login", req.url);
        if (pathname !== "/") {
            loginUrl.searchParams.set("redirect", pathname + search);
        }
        return NextResponse.redirect(loginUrl);
    }

    // JWT Secret for verification
    const secret = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET_KEY;
    
    // If no secret is configured, we can't verify the token
    // But we still have a token, so allow access (backend will validate)
    if (!secret) {
        console.warn("[middleware] No JWT secret configured - token exists but cannot be verified");
        return NextResponse.next();
    }

    try {
        await jwtVerify(token, new TextEncoder().encode(secret));
        return NextResponse.next();
    } catch (err) {
        // Token is invalid or expired - redirect to login
        console.warn("[middleware] JWT verification failed, redirecting to login");
        const loginUrl = new URL("/login", req.url);
        if (pathname !== "/") {
            loginUrl.searchParams.set("redirect", pathname + search);
        }
        // Clear the invalid cookie
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(TOKEN_COOKIE);
        return response;
    }
}

export const config = {
    // Run middleware on all routes except static files
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
