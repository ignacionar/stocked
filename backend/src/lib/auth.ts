import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from '@/lib/prisma'
import bcrypt from "bcrypt";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        default: "USER",
        input: true,
      },
      plan: {
        type: "string",
        required: true,
        default: "BASIC",
        input: true,
      },
      occupation: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      trustedProviders: ["google"],
      enabled: true,
      updateUserInfoOnLink: true,
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.FRONTEND_URL}/api/auth/callback/google`,
      disableSignUp: true,
      disableImplicitSignUp: true,
      mapProfileToUser: async (profile) => {

      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!existingUser) {
        return;
      }

      await prisma.user.update({
        where: { email: profile.email },
        data: {
          image: profile.picture,
        }
      })

      return {
        image: profile.picture,
        emailVerified: true,
      }
    },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      }
  }
  },
  trustedOrigins: ['http://localhost:3000', 'http://192.168.100.2:3000'],
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: "none",
          secure: true
        }
      }
    }
  },
  experimental: { joins: true },
  session: { expiresIn: 24 * 60 * 60 } // 1 day
});