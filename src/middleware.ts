import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  
  // Liberar arquivos estáticos, imagens, ícones do PWA e manifesto
  const isPublicAsset = request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico|json|js)$/);

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // Se não tem token e não está na página de login, redireciona
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se tem token e tenta acessar /login, manda pro inicio
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configura quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
