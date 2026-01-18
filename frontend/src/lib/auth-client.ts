import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from "better-auth/client/plugins";

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
  inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
        plan: {
          type: "string"
        },
        occupation: {
          type: "string"
        }
      },
    }),
    {
      id: 'next-cookies-request',
      fetchPlugins: [{
        id: 'next-cookies-request-plugin',
        name: 'next-cookies-request-plugin',
        hooks: {
          async onRequest(ctx) {
            if (typeof window === 'undefined') {
              const { cookies } = await import('next/headers');
              const headers = await cookies();
              ctx.headers.set('cookie', headers.toString());
            }
          }
        }
      }]
    }
  ]
})