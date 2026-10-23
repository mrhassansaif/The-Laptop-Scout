import {
  FORCE_LOGOUT_PARTIAL_NOTICE,
  FORCE_LOGOUT_SUCCESS_NOTICE,
} from "@/lib/session/revocation";

export type ForceLogoutClientResult =
  | { ok: true; notice: string }
  | { ok: false; message: string };

type RefreshTokenReport = {
  attempted?: boolean;
  failed?: number;
  completed?: boolean;
};

function readErrorMessage(body: unknown, status: number): string {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string" &&
    body.error.length > 0 &&
    body.error.length <= 180
  ) {
    return body.error;
  }

  if (status === 401) {
    return "Your session is no longer valid. Sign in again.";
  }

  if (status === 403) {
    return "You are not allowed to end all sessions.";
  }

  if (status === 503) {
    return "Force logout is not configured on the server.";
  }

  return "Could not end sessions. Try again.";
}

function refreshRevocationIncomplete(body: unknown): boolean {
  if (!body || typeof body !== "object" || !("refreshTokens" in body)) {
    return false;
  }

  const report = (body as { refreshTokens: RefreshTokenReport }).refreshTokens;

  if (!report || report.attempted !== true) {
    return false;
  }

  return report.completed === false || (report.failed ?? 0) > 0;
}

export async function requestForceLogout(
  idToken: string,
): Promise<ForceLogoutClientResult> {
  let response: Response;

  try {
    response = await fetch("/api/admin/force-logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch {
    return {
      ok: false,
      message: "Could not reach the server. Check your connection and try again.",
    };
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, message: readErrorMessage(body, response.status) };
  }

  return {
    ok: true,
    notice: refreshRevocationIncomplete(body)
      ? FORCE_LOGOUT_PARTIAL_NOTICE
      : FORCE_LOGOUT_SUCCESS_NOTICE,
  };
}
