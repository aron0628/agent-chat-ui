import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmailOrUserId } from "./auth-db";
import { getCachedSessionVersion, clearUserCache } from "./session-version-cache";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await getUserByEmailOrUserId(email);
        if (!user) return null;
        if (!user.is_active) return null;

        const isValid = await bcrypt.compare(password, user.hashed_password);
        if (!isValid) return null;

        return {
          id: user.user_id,
          email: user.email,
          name: user.display_name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,      // 8시간
    updateAge: 60 * 60,       // 1시간마다 쿠키 갱신 (rolling)
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign-in: store user data in token
      if (trigger === "signIn" && user) {
        token.sub = user.id;
        token.role = (user as { role: string }).role;
        try {
          const { getSessionVersion } = await import("./auth-db");
          token.sessionVersion = await getSessionVersion(user.id!);
        } catch {
          token.sessionVersion = 0;
        }
        return token;
      }

      // Subsequent requests: check session_version
      if (token.sub) {
        try {
          const currentVersion = await getCachedSessionVersion(token.sub);
          if (currentVersion !== token.sessionVersion) {
            // Session version mismatch — force re-auth
            return null;
          }
        } catch {
          // DB error — fail-secure: force re-auth
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
});

// Export clearUserCache for logout usage
export { clearUserCache };
