import { type NextRequest, NextResponse } from 'next/server'
import { updateSession, createClient } from './src/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Create response and client
    const response = await updateSession(request)
    const supabase = createClient(request, response)

    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser()

    // Get the pathname from the URL
    const pathname = request.nextUrl.pathname

    // If user is logged in and tries to access /login, redirect to /app
    if (pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/app', request.url))
    }

    // If user is not logged in and tries to access /app/*, redirect to /login
    // if (pathname.startsWith('/app')) {
    //     if (!user || error) {
    //         const redirectUrl = new URL('/login', request.url)
    //         redirectUrl.searchParams.set('redirect_to', pathname)
    //         return NextResponse.redirect(redirectUrl)
    //     }
    // }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
// From Clerk docs as example. Clerk is not used here.
// export const config = {
//     matcher: [
//         // Skip Next.js internals and all static files, unless found in search params
//         '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//         // Always run for API routes
//         '/(api|trpc)(.*)',
//     ],
// }