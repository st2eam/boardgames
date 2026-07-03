export function normalizeNumericInput(value: string): string {
  return value.replace(/\D/g, "");
}
