/** Media shortcode helpers for post bodies (imported from `_config.ts`). */

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type EmbedResult =
  | { mode: "iframe"; src: string }
  | { mode: "link"; href: string };

/** Map share URLs → embed URLs. No external deps — string/URL parsing only. */
export function normalizeEmbedUrl(
  url: string,
  kind: "video" | "audio",
): EmbedResult {
  try {
    if (url.includes("youtu.be/") || url.includes("youtube.com/watch")) {
      const videoId = url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split(/[?#]/)[0] ?? ""
        : new URL(url).searchParams.get("v") ?? "";
      if (!videoId) return { mode: "link", href: url };
      return { mode: "iframe", src: `https://www.youtube.com/embed/${videoId}` };
    }

    if (url.includes("open.spotify.com")) {
      const embedUrl = url.includes("/embed/")
        ? url
        : url.replace("open.spotify.com/", "open.spotify.com/embed/");
      return { mode: "iframe", src: embedUrl.split("?")[0] ?? embedUrl };
    }

    if (url.includes("soundcloud.com")) {
      // Official player: w.soundcloud.com/player/?url=<encoded share url>
      if (url.includes("w.soundcloud.com/player")) {
        return { mode: "iframe", src: url };
      }
      const encoded = encodeURIComponent(url.split("?")[0] ?? url);
      return {
        mode: "iframe",
        src:
          `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
      };
    }

    if (url.includes("bandcamp.com")) {
      // Only iframe when the URL already looks embed-capable (EmbeddedPlayer /track_list etc.)
      if (
        url.includes("EmbeddedPlayer") ||
        url.includes("/EmbeddedPlayer/") ||
        url.includes("bandcamp.com/EmbeddedPlayer")
      ) {
        return { mode: "iframe", src: url };
      }
      return { mode: "link", href: url };
    }
  } catch {
    return { mode: "link", href: url };
  }

  void kind;
  return { mode: "link", href: url };
}

/**
 * Resolve author image path under `src/assets/images/` to the built URL.
 * SVG stays as-is (via `site.loadAssets([".svg"])`).
 * Raster JPG/JPEG/PNG → `.webp` to match `transform_images` + `src/assets/images/_data.yml`.
 */
export function resolveImageSrc(src: string): string {
  const cleaned = src.replace(/^\/+/, "");
  const withWebp = cleaned.replace(/\.(jpe?g|png)$/i, ".webp");
  return `/assets/images/${withWebp}`;
}

export type MediaSize = "wide" | "full" | "text";

export function normalizeSize(
  size: string | undefined,
  fallback: MediaSize = "wide",
): MediaSize {
  if (size === "full" || size === "text" || size === "wide") return size;
  return fallback;
}

function captionHtml(caption: string | undefined): string {
  if (!caption) return "";
  return `\n  <figcaption class="post-media__caption">${escapeHtml(caption)}</figcaption>`;
}

/** HTML mirrors `src/_includes/partials/post-media.vto` (kind=image). */
export function renderPostImage(
  src: string,
  alt = "",
  caption?: string,
  size?: string,
): string {
  const sz = normalizeSize(size, "wide");
  return `<figure class="post-media post-media--${sz}">\n  <img src="${resolveImageSrc(src)}" alt="${escapeHtml(alt)}" loading="lazy">${captionHtml(caption)}\n</figure>`;
}

/** HTML mirrors partial kind=embed|link for video. */
export function renderPostVideo(
  url: string,
  caption?: string,
  size?: string,
): string {
  const sz = normalizeSize(size, "wide");
  const title = escapeHtml(caption ?? "Vídeo");
  const normalized = normalizeEmbedUrl(url, "video");

  if (normalized.mode === "link") {
    const label = escapeHtml(caption ?? url);
    return `<a class="post-media post-media--link" href="${escapeHtml(normalized.href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  return `<figure class="post-media post-media--${sz}">\n  <div class="media-embed">\n    <iframe src="${escapeHtml(normalized.src)}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>\n  </div>${captionHtml(caption)}\n</figure>`;
}

/** HTML mirrors partial kind=audio|link. Always wide. */
export function renderPostAudio(url: string, caption?: string): string {
  const title = escapeHtml(caption ?? "Áudio");
  const normalized = normalizeEmbedUrl(url, "audio");

  if (normalized.mode === "link") {
    const label = escapeHtml(caption ?? url);
    return `<a class="post-media post-media--link" href="${escapeHtml(normalized.href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  const spotify = normalized.src.includes("spotify.com")
    ? " post-media--spotify"
    : "";
  return `<div class="post-media post-media--wide post-media--audio${spotify}">\n  <iframe src="${escapeHtml(normalized.src)}" title="${title}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>${captionHtml(caption)}\n</div>`;
}

/** HTML mirrors partial kind=gallery. Items: `"src|alt|caption"`. */
export function renderPostGallery(
  first: string,
  ...rest: string[]
): string {
  const items = [first, ...rest];
  const figures = items.map((item) => {
    const [src = "", alt = "", cap] = item.split("|");
    const figcaption = cap
      ? `\n    <figcaption class="post-media__caption">${escapeHtml(cap)}</figcaption>`
      : "";
    return `  <figure class="post-gallery__item">\n    <img src="${resolveImageSrc(src)}" alt="${escapeHtml(alt)}" loading="lazy">${figcaption}\n  </figure>`;
  }).join("\n");
  return `<div class="post-media post-media--wide post-gallery">\n${figures}\n</div>`;
}

/** HTML mirrors partial kind=quote. */
export function renderPostQuote(text: string, attribution?: string): string {
  const cite = attribution
    ? `\n  <cite>${escapeHtml(attribution)}</cite>`
    : "";
  return `<blockquote>\n  <p>${escapeHtml(text)}</p>${cite}\n</blockquote>`;
}
