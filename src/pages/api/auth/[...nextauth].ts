import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function getAllowedEmails(): Promise<string[]> {
  try {
    const r = await fetch(
      `https://raw.githubusercontent.com/raf770/sitrep-next/main/content/config/allowed-emails.json?t=${Date.now()}`
    );
    if (r.ok) {
      const data = await r.json();
      return data.emails || [];
    }
  } catch (e) {}
  return ["parienteraphael@gmail.com"];
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowed = await getAllowedEmails();
      return allowed.includes(user.email!);
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};

export default NextAuth(authOptions);
