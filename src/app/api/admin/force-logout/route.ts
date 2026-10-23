import { NextResponse } from "next/server";

import {
  FirebaseAdminConfigError,
} from "@/lib/firebase/admin";
import {
  AdminAccessRequiredError,
  forceLogoutAllSessions,
  SessionAlreadyRevokedError,
} from "@/lib/session/force-logout-server";
import { readBearerToken } from "@/lib/session/revocation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

export async function POST(request: Request) {
  const idToken = readBearerToken(request.headers.get("authorization"));

  if (!idToken) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const result = await forceLogoutAllSessions(idToken);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SessionAlreadyRevokedError) {
      return NextResponse.json(
        { error: "This session has ended. Sign in again." },
        { status: 401 },
      );
    }

    if (error instanceof AdminAccessRequiredError) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
    }

    if (error instanceof FirebaseAdminConfigError) {
      return NextResponse.json(
        { error: "Force logout is not configured." },
        { status: 503 },
      );
    }

    const code = errorCode(error);
    if (code?.startsWith("auth/")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const credentialFailure =
      error instanceof Error &&
      /private key|credential|\bPEM\b|BEGIN /i.test(error.message);

    if (credentialFailure) {
      console.error("Force logout failed.", { name: error.name, code });
      return NextResponse.json(
        { error: "Force logout is not configured." },
        { status: 503 },
      );
    }

    console.error("Force logout failed.", {
      name: error instanceof Error ? error.name : "unknown",
      code,
    });

    return NextResponse.json(
      { error: "Could not end sessions." },
      { status: 500 },
    );
  }
}
