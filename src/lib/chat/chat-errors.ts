export type ChatErrorCode =
  | "auth"
  | "rateLimit"
  | "quota"
  | "thinking"
  | "network"
  | "timeout"
  | "invalidRequest"
  | "server"
  | "unknown";

export class DeepSeekApiError extends Error {
  readonly status: number;
  readonly apiMessage: string;

  constructor(status: number, body: string) {
    const apiMessage = extractApiMessage(body) || body || `HTTP ${status}`;
    super(`DeepSeek API error ${status}: ${apiMessage}`);
    this.name = "DeepSeekApiError";
    this.status = status;
    this.apiMessage = apiMessage;
  }
}

function extractApiMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string };
      message?: string;
    };
    return parsed.error?.message ?? parsed.message ?? "";
  } catch {
    return body.trim();
  }
}

export function classifyChatError(err: unknown): ChatErrorCode {
  if (err instanceof TypeError) {
    // fetch network failures in browsers typically land here
    return "network";
  }

  const status = err instanceof DeepSeekApiError ? err.status : undefined;
  const message =
    err instanceof DeepSeekApiError
      ? err.apiMessage
      : err instanceof Error
        ? err.message
        : String(err ?? "");
  const lower = message.toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    lower.includes("authentication") ||
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("api key")
  ) {
    return "auth";
  }

  if (
    status === 429 ||
    lower.includes("rate limit") ||
    lower.includes("too many requests")
  ) {
    return "rateLimit";
  }

  if (
    lower.includes("insufficient") ||
    lower.includes("quota") ||
    lower.includes("balance") ||
    lower.includes("payment") ||
    lower.includes("billing")
  ) {
    return "quota";
  }

  if (
    lower.includes("thinking") ||
    lower.includes("reasoning_content") ||
    lower.includes("must be passed back")
  ) {
    return "thinking";
  }

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("deadline")
  ) {
    return "timeout";
  }

  if (status === 400 || lower.includes("invalid_request")) {
    return "invalidRequest";
  }

  if (status !== undefined && status >= 500) {
    return "server";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("offline")
  ) {
    return "network";
  }

  return "unknown";
}

/** i18n keys under `chat.*` */
export function chatErrorMessageKey(code: ChatErrorCode): string {
  switch (code) {
    case "auth":
      return "errorAuth";
    case "rateLimit":
      return "errorRateLimit";
    case "quota":
      return "errorQuota";
    case "thinking":
      return "errorThinking";
    case "network":
      return "errorNetwork";
    case "timeout":
      return "errorTimeout";
    case "invalidRequest":
      return "errorInvalidRequest";
    case "server":
      return "errorServer";
    default:
      return "errorUnknown";
  }
}
