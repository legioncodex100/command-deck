import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
    try {
        // Create an unmodified response
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                        response = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options),
                        );
                    },
                },
            },
        );

        // Refresh Session
        const { data: { user }, error } = await supabase.auth.getUser();

        // PROTECTED ROUTES LOGIC
        // 1. Define Public Routes (Login, Auth callbacks, Static assets)
        // We strictly protect EVERYTHING except these.

        // Ignore static files
        if (
            request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.startsWith('/static') ||
            request.nextUrl.pathname.includes('.') // images, standard files
        ) {
            return response;
        }

        const isLogin = request.nextUrl.pathname.startsWith('/login');
        const isAuth = request.nextUrl.pathname.startsWith('/auth');
        const isRoot = request.nextUrl.pathname === '/';

        // 2. Redirect Unauthenticated Users to Login (Protect everything else)
        if (!user && !isLogin && !isAuth && !isRoot) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // 3. Redirect Authenticated Users AWAY from Login/Root (to dashboard)
        if (user && (isLogin || isRoot)) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }

        return response;
    } catch (e) {
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};
