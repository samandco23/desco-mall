import type { NextAuthConfig } from "next-auth";

/**
 * Configuration partagée, compatible Edge (utilisée par le middleware).
 * Les providers sont ajoutés dans `lib/auth.ts` côté serveur Node.
 */
export const authConfig = {
  pages: {
    signIn: "/connexion",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = (token.id as string | undefined) ?? "";
      session.user.role =
        (token.role as "USER" | "ADMIN" | undefined) ?? "USER";
      return session;
    },
  },
} satisfies NextAuthConfig;
