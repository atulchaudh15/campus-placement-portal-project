// Escapes special regex characters so user search input can't be used to
// build unintended regex patterns (regex injection / ReDoS).
export const escapeRegex = (str = "") =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
