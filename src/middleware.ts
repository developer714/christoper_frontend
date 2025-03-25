import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define public routes that don't need protection
  const publicRoutes = ['/login', '/register', '/services', '/about', '/contact', '/favicon.ico'];
  
  // Skip middleware for Next.js internal routes and static files
  if (pathname.includes('/_next') || pathname.endsWith('.png') || pathname.endsWith('.ico')) {
    return NextResponse.next();
  }

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // Get token from cookies
  const token = request.cookies.get('token');
  
  // Allow access to public routes without redirecting
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected pages
  if (!token) {
    const response = NextResponse.redirect('https://christoperfrontend-production.up.railway.app/login');
    response.cookies.delete('token');
    return response;
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