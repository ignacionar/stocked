import { NextRequest, NextResponse } from "next/server";
import { Role } from "@shared/types/entities";
import { getSession } from "./lib/auth-client";
import { ApiClient } from "./lib/api/api-client";

export async function proxy(request: NextRequest) {

  /* ======================================================
    BACKEND HEALTHCHECK
  ====================================================== */    
  const health = await ApiClient.healthcheck();

  if (!health.ok) {
    if (request.nextUrl.pathname !== "/error") {
      return NextResponse.redirect(new URL("/error", request.url));
    } else {
      return;
    }
  } else {
    if (request.nextUrl.pathname === "/error") {
      return NextResponse.redirect(new URL("/login", request.url));
    } 
  }

  /* ======================================================
    HANDLE USER SESSION
   ====================================================== */  

  const { data: session } = await getSession();

  if (!session && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/-", request.url));
  }

  if (session?.user.role === Role.USER && request.nextUrl.pathname === "/users") {
    return NextResponse.redirect(new URL("/-", request.url));
  }

  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL("/-", request.url))
  }

  /* ======================================================
    PLACEHOLDER - REMOVE ON PRODUCTION
   ====================================================== */  

  if (!session && request.nextUrl.pathname === '/placeholder/signup') {
    return NextResponse.next();
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!signup|api|_next|.*\\..*).*)",], // Specify the routes the middleware applies to
};