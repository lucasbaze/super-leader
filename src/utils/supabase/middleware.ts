import { type NextRequest, NextResponse } from 'next/server';

import { type CookieOptions, createServerClient } from '@supabase/ssr';

export function createClient(request: NextRequest, response: NextResponse) {
    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                response.cookies.set({
                    name,
                    value,
                    ...options
                });
            },
            remove(name: string, options: CookieOptions) {
                response.cookies.set({
                    name,
                    value: '',
                    ...options
                });
            }
        }
    });
}

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers
        }
    });

    const supabase = createClient(request, response);

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();

    return response;
}
