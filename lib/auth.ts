import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { db, hasDatabase } from "@/lib/db";
import { DEMO_ACCOUNTS } from "@/lib/demo-data";
import { loginSchema } from "@/lib/validations/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();

        if (!hasDatabase) {
          const demo = Object.values(DEMO_ACCOUNTS).find(
            (account) => account.email === email
          );
          if (!demo || demo.password !== parsed.data.password) return null;
          return {
            id: demo.id,
            name: demo.name,
            email: demo.email,
            role: demo.role,
          };
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: null,
          role: user.role,
        };
      },
    }),
  ],
});
