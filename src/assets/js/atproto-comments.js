(function () {
  const container = document.querySelector(".post-comments[data-thread-uri]");
  if (!container) return;

  const threadUri = container.dataset.threadUri;
  const postUrl = container.dataset.postUrl;
  const appview = container.dataset.appview;

  // Label values that trigger omission
  const HIDE_LABELS = new Set([
    "!hide",
    "!no-promote",
    "porn",
    "sexual",
    "graphic-media",
    "nudity",
  ]);

  function isHiddenByLabel(labels) {
    if (!Array.isArray(labels)) return false;
    return labels.some((l) => HIDE_LABELS.has(l.val));
  }

  // Collect rkeys of replies hidden by threadgate
  function hiddenRkeys(thread) {
    try {
      const hr = thread.threadgate?.record?.hiddenReplies;
      if (!Array.isArray(hr)) return new Set();
      return new Set(hr.map((ref) => ref.uri?.split("/").pop()));
    } catch (_) {
      return new Set();
    }
  }

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang || "en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch (_) {
      return iso;
    }
  }

  function buildFacetedText(record) {
    const text = record.text || "";
    const facets = record.facets || [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

    // Collect http/https link facets
    const links = [];
    for (const facet of facets) {
      for (const feature of facet.features || []) {
        if (feature.$type === "app.bsky.richtext.facet#link") {
          const uri = feature.uri || "";
          if (uri.startsWith("http://") || uri.startsWith("https://")) {
            links.push({ start: facet.index.byteStart, end: facet.index.byteEnd, uri });
          }
        }
      }
    }
    links.sort((a, b) => a.start - b.start);

    const fragment = document.createDocumentFragment();
    const decoder = new TextDecoder();
    let pos = 0;

    for (const link of links) {
      if (link.start > pos) {
        fragment.appendChild(
          document.createTextNode(decoder.decode(bytes.slice(pos, link.start))),
        );
      }
      const a = document.createElement("a");
      a.href = link.uri;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      // 5.7: use textContent (safe, no HTML interpretation)
      a.textContent = decoder.decode(bytes.slice(link.start, link.end));
      fragment.appendChild(a);
      pos = link.end;
    }
    if (pos < bytes.length) {
      fragment.appendChild(
        document.createTextNode(decoder.decode(bytes.slice(pos))),
      );
    }
    return fragment;
  }

  function renderReply(view, depth, hidden) {
    if (view.$type === "app.bsky.feed.defs#blockedPost") return null;
    if (view.$type !== "app.bsky.feed.defs#threadViewPost") return null;

    const rkey = view.post?.uri?.split("/").pop();
    if (hidden.has(rkey)) return null;
    if (isHiddenByLabel(view.post?.labels)) return null;

    const post = view.post;
    const author = post?.author || {};
    const record = post?.record || {};

    const item = document.createElement("div");
    item.className = "atproto-reply";
    item.style.marginLeft = depth ? `${depth * 1.5}em` : "0";

    const header = document.createElement("div");
    header.className = "atproto-reply__header";

    const name = document.createElement("span");
    name.className = "atproto-reply__author";
    // 5.7: textContent — no HTML injection
    name.textContent = author.displayName || author.handle || "Unknown";

    const handle = document.createElement("span");
    handle.className = "atproto-reply__handle";
    handle.textContent = " @" + (author.handle || "");

    const time = document.createElement("time");
    time.className = "atproto-reply__time";
    time.dateTime = record.createdAt || "";
    time.textContent = formatDate(record.createdAt || "");

    header.appendChild(name);
    header.appendChild(handle);
    header.appendChild(time);
    item.appendChild(header);

    const body = document.createElement("p");
    body.className = "atproto-reply__text";
    body.appendChild(buildFacetedText(record));
    item.appendChild(body);

    // Recurse into replies in chronological order
    const replies = (view.replies || [])
      .filter((r) => r.$type === "app.bsky.feed.defs#threadViewPost")
      .sort((a, b) => {
        const ta = new Date(a.post?.record?.createdAt || 0).getTime();
        const tb = new Date(b.post?.record?.createdAt || 0).getTime();
        return ta - tb;
      });

    for (const reply of replies) {
      const child = renderReply(reply, depth + 1, hidden);
      if (child) item.appendChild(child);
    }

    return item;
  }

  function renderEmpty() {
    const div = document.createElement("div");
    div.className = "atproto-comments__empty";
    const a = document.createElement("a");
    a.href = postUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    // i18n: use lang attribute of <html>
    a.textContent =
      document.documentElement.lang === "pt"
        ? "Comentar no Bluesky"
        : "Comment on Bluesky";
    div.appendChild(a);
    return div;
  }

  function renderError() {
    const div = document.createElement("div");
    div.className = "atproto-comments__error";
    div.textContent =
      document.documentElement.lang === "pt"
        ? "Não foi possível carregar os comentários."
        : "Comments couldn't be loaded.";
    return div;
  }

  async function load() {
    const url = `${appview}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(threadUri)}&depth=6&parentHeight=0`;
    let data;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      data = await res.json();
    } catch (_) {
      // 5.6: discrete error state
      container.appendChild(renderError());
      return;
    }

    const thread = data.thread;

    // 5.3: notFoundPost → empty state
    if (!thread || thread.$type === "app.bsky.feed.defs#notFoundPost") {
      container.appendChild(renderEmpty());
      return;
    }

    // 5.3: blockedPost → omit (show empty)
    if (thread.$type === "app.bsky.feed.defs#blockedPost") {
      container.appendChild(renderEmpty());
      return;
    }

    const hidden = hiddenRkeys(thread);

    // 5.4: replies in chronological order
    const replies = (thread.replies || [])
      .filter((r) => r.$type === "app.bsky.feed.defs#threadViewPost")
      .sort((a, b) => {
        const ta = new Date(a.post?.record?.createdAt || 0).getTime();
        const tb = new Date(b.post?.record?.createdAt || 0).getTime();
        return ta - tb;
      });

    if (replies.length === 0) {
      container.appendChild(renderEmpty());
      return;
    }

    const list = document.createElement("div");
    list.className = "atproto-comments__list";
    for (const reply of replies) {
      const el = renderReply(reply, 0, hidden);
      if (el) list.appendChild(el);
    }
    container.appendChild(list);

    // 5.6: always append "comment" link at the bottom
    container.appendChild(renderEmpty());
  }

  load();
})();
