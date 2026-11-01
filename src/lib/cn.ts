type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Enough for this project; avoids a class-merging dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
