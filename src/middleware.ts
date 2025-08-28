// src/middleware.ts
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'pl',
  localePrefix: 'always',
});

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/pl', request.url));
  }

  // Najpierw obsłuż internacjonalizację
  const response = await intlMiddleware(request);

  // Sprawdź czy to ścieżka examples
  const segments = request.nextUrl.pathname.split('/');
  const examplesIndex = segments.findIndex((segment) => segment === 'examples');

  if (examplesIndex !== -1 && segments[examplesIndex + 2]) {
    const potentialWorkTypeOrSubject = segments[examplesIndex + 2];
    // Ignoruj jeśli to już jest subjects
    if (potentialWorkTypeOrSubject === 'subjects') {
      return response;
    }
    try {
      // Sprawdź czy to workType
      const workTypeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/work-types/${potentialWorkTypeOrSubject}`
      );
      // Jeśli to nie workType, nie rób przekierowania automatycznie
      if (!workTypeResponse.ok) {
        const subjectResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${potentialWorkTypeOrSubject}`
        );
        if (subjectResponse.ok) {
          // Zwróć oryginalną odpowiedź zamiast przekierowania
          return response;
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
    }
  }

  // Dodaj własne nagłówki
  const referer = request.headers.get('referer');
  if (referer) {
    response.headers.set('X-Real-Referer', referer);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/:locale/examples/:level/:path*'],
};
