export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://bta-lab.com";

  try {
    const url = new URL(raw);
    if (process.env.NODE_ENV === "production") {
      url.protocol = "https:";
    }
    return url.origin;
  } catch {
    return "https://bta-lab.com";
  }
}
