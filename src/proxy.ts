import {NextResponse} from 'next/server';
import {auth} from '@/auth';

export const proxy = auth(request => {
  const isLoggedIn = Boolean(request.auth?.user);
  const isLoginRoute = request.nextUrl.pathname === '/login';

  if (isLoginRoute) {
    return isLoggedIn
      ? NextResponse.redirect(new URL('/dashboard', request.nextUrl))
      : NextResponse.next();
  }

  if (!isLoggedIn) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({message: 'Unauthorized'}, {status: 401});
    }

    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
