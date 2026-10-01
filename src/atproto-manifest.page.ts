import { atprotoTid } from "./_lib/atproto-tid.ts";

export const url = "/atproto/manifest.json";

function toPlainText(source: string): string {
  return source
    // Strip Vento template expressions (shortcodes)
    .replace(/\{\{[\s\S]*?\}\}/g, " ")
    // Strip HTML tags
    .replace(/<[^>]+>/g, " ")
    // Strip Markdown headings
    .replace(/^#{1,6}\s+/gm, "")
    // Strip Markdown bold/italic
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    // Strip Markdown images before links (avoids capturing alt text as link text)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Strip Markdown links (keep link text)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export default async function (
  { search, atproto }: Lume.Data,
): Promise<string> {
  const posts = search.pages("type=post", "date=asc");
  const anchorSince = new Date(atproto.anchorSince);

  const entries = [];
  for (const page of posts) {
    // 3.3: skip posts without date or marked as draft
    if (!page.date || page.draft) continue;

    const rkey = await atprotoTid(
      String(page.slug),
      String(page.lang),
      page.date as Date,
    );
    const publishedAt = new Date(page.date as Date).toISOString();
    const updatedAt = page.updatedAt
      ? new Date(page.updatedAt as Date).toISOString()
      : null;

    // 3.4: anchor = publishedAt >= anchorSince
    const anchor = new Date(publishedAt) >= anchorSince;

    const path = String(page.url);
    const pageUrl = atproto.publication.url + path;

    // 3.2: convert rendered HTML body to plain text
    const rawContent = String(page.content || "");
    const textContent = toPlainText(rawContent);

    entries.push({
      rkey,
      slug: String(page.slug),
      lang: String(page.lang),
      title: String(page.title || ""),
      description: String(page.description || ""),
      path,
      url: pageUrl,
      publishedAt,
      updatedAt,
      tags: (page.tags as string[]) || [],
      textContent,
      anchor,
    });
  }

  return JSON.stringify(
    {
      did: atproto.did,
      publication: atproto.publication,
      entries,
    },
    null,
    2,
  );
}
