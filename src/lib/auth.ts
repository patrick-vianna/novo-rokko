import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  callbacks: {
    async onSession({ session, user }: { session: any; user: any }) {
      if (!user.email?.endsWith("@v4company.com")) {
        throw new Error("Acesso restrito a emails @v4company.com");
      }
      return session;
    },
  },

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});
