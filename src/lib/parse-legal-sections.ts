/**
 * Parse markdown content with `##` headings into title/body sections.
 * Falls back to the provided static sections when no headings are found.
 */
export function parseLegalSections(
  content: string,
  fallbackSections: Array<{ title: string; body: string }>
): Array<{ title: string; body: string }> {
  if (!content.trim()) return fallbackSections;

  const headingRegex = /^##\s+(.+)$/gm;
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const sections: Array<{ title: string; body: string }> = [];

  let currentTitle = "";
  let currentBody: string[] = [];

  for (const paragraph of paragraphs) {
    // Reset lastIndex since regex is reused within the same call
    headingRegex.lastIndex = 0;
    const headingMatch = headingRegex.exec(paragraph);

    if (headingMatch) {
      // Push the previous section if we have one
      if (currentTitle) {
        sections.push({ title: currentTitle, body: currentBody.join("\n\n") });
      }
      currentTitle = headingMatch[1];
      currentBody = [];
      // Capture any text after the heading within the same paragraph
      const textAfterHeading = paragraph.replace(/^##\s+.+$/gm, "").trim();
      if (textAfterHeading) {
        currentBody.push(textAfterHeading);
      }
    } else {
      // Text before the first heading or continuation of current section
      currentBody.push(paragraph);
    }
  }

  // Push the last section
  if (currentTitle) {
    sections.push({ title: currentTitle, body: currentBody.join("\n\n") });
  } else if (currentBody.length > 0) {
    // Content exists but no headings found — return as a single section
    return fallbackSections;
  }

  return sections.length > 0 ? sections : fallbackSections;
}
