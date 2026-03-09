export function sanitizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function sanitizeStringArray(values) {
  return values.map((value) => sanitizeString(value));
}

