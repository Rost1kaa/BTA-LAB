import "server-only";

import { headers } from "next/headers";

export function getClientIpFromHeaders(headersList: Headers) {
  return (
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-real-ip") ||
    headersList.get("x-forwarded-for") ||
    "unknown"
  );
}

export async function getRequestContext() {
  const headersList = await headers();
  return {
    headers: headersList,
    ip: getClientIpFromHeaders(headersList),
    route: headersList.get("next-url") || headersList.get("referer") || "unknown",
  };
}

export async function verifySameOriginRequest() {
  const headersList = await headers();
  return verifySameOriginHeaders(headersList);
}

export function verifySameOriginHeaders(headersList: Headers) {
  const origin = headersList.get("origin");

  if (!origin) {
    return true;
  }

  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const forwardedProtocol = headersList.get("x-forwarded-proto");

  if (!host) {
    return false;
  }

  try {
    const actual = new URL(origin);
    return (
      actual.host === host &&
      (!forwardedProtocol || actual.protocol === `${forwardedProtocol}:`)
    );
  } catch {
    return false;
  }
}
