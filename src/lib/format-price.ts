/**
 * Format a price amount as a Georgian Lari string with the ₾ symbol before the number.
 *
 * Accepts:
 * - `null` or `undefined`  →  returns `"ინდივიდუალური"`
 * - A numeric amount, e.g. `199`  →  `"₾199"`
 * - A numeric amount with suffix, e.g. `199, "-დან"`  →  `"₾199-დან"`
 * - A string like `"1500+"`  →  `"₾1500+"`
 *
 * The function ALWAYS strips any existing Georgian Lari symbol from the input
 * and prepends a single ₾. The database stores only the numeric value.
 *
 * @param amount  Numeric price value, price string (without currency symbol), or null for custom prices.
 * @param suffix  Optional text appended after the number (e.g. "-დან", " / თვეში").
 */
export function formatPrice(amount: number | string | null | undefined, suffix?: string): string {
  if (amount == null) return "ინდივიდუალური";

  if (typeof amount === "number") {
    return `₾${amount}${suffix ?? ""}`;
  }

  // Custom / placeholder prices — return as-is
  if (amount === "CUSTOM" || amount === "ინდივიდუალური") {
    return amount;
  }

  // Strip any existing currency symbols (₾, $) and spaces from input
  const cleaned = amount.replace(/[₾$\s]/g, "").trim();
  if (cleaned.length === 0) return amount;

  // Always output ₾ immediately followed by the number — no space!
  return `₾${cleaned}${suffix ?? ""}`;
}
