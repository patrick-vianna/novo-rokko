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

  trustedOrigins: [
    "https://rokko.rustontools.tech",
    "https://ops.rokko.rustontools.tech",
    "https://sales.rokko.rustontools.tech",
    "https://finance.rokko.rustontools.tech",
    "https://people.rokko.rustontools.tech",
    "http://localhost:3000",
  ],

  advanced: {
    cookiePrefix: "rokko",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? ".rustontools.tech" : undefined,
    },
  },

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});
