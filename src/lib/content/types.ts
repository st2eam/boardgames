import type { GameMeta, FlowData } from "@/types/game";

export interface RepositoryError {
  code: "NOT_FOUND" | "INVALID_LOCALE";
  message: string;
}

export type RepositoryResult<T> = T | RepositoryError;

export function isRepositoryError(
  result: RepositoryResult<unknown>
): result is RepositoryError {
  return (
    typeof result === "object" &&
    result !== null &&
    "code" in result &&
    "message" in result
  );
}

export type { GameMeta, FlowData };
