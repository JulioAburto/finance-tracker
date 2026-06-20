const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export function readPositiveNumber(
  formData: FormData,
  name: string,
): number | null {
  const value = Number(readText(formData, name));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function readNonNegativeNumber(
  formData: FormData,
  name: string,
): number | null {
  const value = Number(readText(formData, name));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function readInteger(formData: FormData, name: string): number | null {
  const value = Number(readText(formData, name));
  return Number.isInteger(value) ? value : null;
}

export function readBoolean(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isValidRulePattern(value: string): boolean {
  if (!value || value.length > 240) return false;

  try {
    new RegExp(value, "i");
    return true;
  } catch {
    return false;
  }
}

export function areValidThresholds(
  warning: number | null,
  danger: number | null,
  exceeded: number | null,
): boolean {
  return (
    warning !== null &&
    danger !== null &&
    exceeded !== null &&
    warning > 0 &&
    danger > warning &&
    exceeded >= danger
  );
}
