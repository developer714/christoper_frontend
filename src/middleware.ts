import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check for token in cookies
  const token = request.cookies.get('token');
  
  // For debugging in production - add console logs that will appear in server logs
  console.log(`Middleware running on: ${pathname}, token present: ${!!token}`);
  if (token) {
    console.log(`Token value: ${token.value.substring(0, 10)}...`);
  }
  
  // Define auth routes (don't need protection)
  const authRoutes = ['/login', '/register'];
  
  // Define public routes (accessible without token)
  const publicRoutes = ['/services', '/about', '/contact', '/favicon.ico'];
  
  // Skip middleware for Next.js internal routes
  if (pathname.includes('/_next') || pathname.endsWith('.png') || pathname.endsWith('.ico')) {
    return NextResponse.next();
  }
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // Redirect to login if no token and trying to access protected pages
  if (!token && !isAuthRoute && !isPublicRoute) {
    console.log(`Redirecting to login from ${pathname} - no token found`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to home if has token and trying to access auth routes
  if (token && isAuthRoute) {
    console.log(`Redirecting to home from ${pathname} - user is authenticated`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Run middleware on selected routes only - exclude all static files and Next.js internal routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next (internal Next.js routes)
     * - static files (.png, .jpg, .ico, etc)
     * - api routes (optional, remove if you want middleware to run on API routes)
     */
    '/((?!_next|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)',
  ],
};