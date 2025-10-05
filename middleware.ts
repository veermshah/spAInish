import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/signup", "/auth/callback"];
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith("/api/")
    );

    // Profile setup requires auth but should be accessible
    const isProfileSetup = pathname === "/profile-setup";

    // If it's a public route, allow access
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // For protected routes, check authentication
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If user is not authenticated, redirect to login
    if (!user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirectedFrom", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Allow access to profile setup
    if (isProfileSetup) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public directory)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
