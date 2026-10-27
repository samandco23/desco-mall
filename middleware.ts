import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ACCOUNT_PREFIXES = ["/mon-compte", "/mes-commandes", "/mes-informations"];

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = Boolean(token);
  const isAdmin = token?.role === "ADMIN";

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isAdmin) {
      const url = new URL(
        isLoggedIn ? "/" : "/connexion?callbackUrl=/admin",
        nextUrl
      );
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (ACCOUNT_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix))) {
    if (!isLoggedIn) {
      const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
      return NextResponse.redirect(
        new URL(`/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
      );
    }
    return NextResponse.next();
  }

  if (
    isLoggedIn &&
    (nextUrl.pathname === "/connexion" || nextUrl.pathname === "/inscription")
  ) {
    return NextResponse.redirect(new URL("/mon-compte", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mon-compte/:path*",
    "/mes-commandes/:path*",
    "/mes-informations/:path*",
    "/connexion",
    "/inscription",
  ],
};
