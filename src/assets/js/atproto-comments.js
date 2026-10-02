(function () {
  const container = document.querySelector(".post-comments[data-thread-uri]");
  if (!container) return;

  const threadUri = container.dataset.threadUri;
  const appview = container.dataset.appview;
  const lang = document.documentElement.lang || "en";

  // at://did/app.bsky.feed.post/rkey
  const uriParts = threadUri.split("/");
  const rootDid = uriParts[2];
  const rootRkey = uriParts[4];

  const HIDE_LABELS = new Set([
    "!hide",
    "!no-promote",
    "porn",
    "sexual",
    "graphic-media",
    "nudity",
  ]);

  const KNOWN_APPS = [
    { label: "Bluesky", domain: "bsky.app" },
    { label: "Mu", domain: "mu.social" },
    { label: "Deer", domain: "deer.social" },
  ];
  const KNOWN_DOMAINS = new Set(KNOWN_APPS.map((a) => a.domain));
  const PREF_KEY = "atproto-preferred-app";

  let popoverCounter = 0;

  function isHiddenByLabel(labels) {
    if (!Array.isArray(labels)) return false;
    return labels.some((l) => HIDE_LABELS.has(l.val));
  }

  function hiddenRkeys(thread) {
    try {
      const hr = thread.threadgate?.record?.hiddenReplies;
      if (!Array.isArray(hr)) return new Set();
      return new Set(hr.map((ref) => ref.uri?.split("/").pop()));
    } catch (_) {
      return new Set();
    }
  }

  // Task 5.1 — compact relative time, bilingual
  function formatRelativeTime(iso, lang) {
    const delta = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (delta < 60) return lang === "pt" ? "agora" : "now";
    if (delta < 3600) return `${Math.floor(delta / 60)} m`;
    if (delta < 86400) return `${Math.floor(delta / 3600)} h`;
    if (delta < 2592000) return `${Math.floor(delta / 86400)} d`;
    if (delta < 31536000) return `${Math.floor(delta / 2592000)} ${lang === "pt" ? "me" : "mo"}`;
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }

  // Task 5.2 — absolute date for title tooltip
  function formatAbsoluteDate(iso) {
    try {
      return new Intl.DateTimeFormat(lang, { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
    } catch (_) {
      return iso;
    }
  }

  // Task 3.2 — initials from displayName (grapheme-safe, max 2)
  function getInitials(displayName, handle) {
    const src = (displayName && displayName.trim()) ? displayName.trim() : (handle || "");
    const words = src.split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    const first = [...words[0]][0] || "";
    const second = words.length > 1 ? ([...words[1]][0] || "") : "";
    return (first + second).toUpperCase();
  }

  // Task 3.3 — avatar placeholder element
  function buildPlaceholder(author) {
    const div = document.createElement("div");
    div.className = "atproto-reply__avatar atproto-reply__avatar--placeholder";
    div.textContent = getInitials(author.displayName, author.handle);
    return div;
  }

  // Task 3.1 — avatar wrap with img or placeholder
  function buildAvatarWrap(author) {
    const wrap = document.createElement("div");
    wrap.className = "atproto-reply__avatar-wrap";
    if (author.avatar) {
      const img = document.createElement("img");
      img.className = "atproto-reply__avatar";
      img.src = author.avatar;
      img.alt = "";
      img.loading = "lazy";
      img.width = 32;
      img.height = 32;
      // Task 3.4 — fallback to placeholder on CDN error
      img.onerror = () => img.replaceWith(buildPlaceholder(author));
      wrap.appendChild(img);
    } else {
      wrap.appendChild(buildPlaceholder(author));
    }
    return wrap;
  }

  // Tasks 4.1, 4.3, 4.4, 4.5 — popover with known apps + custom domain input
  function buildAppPopover(targetDid, targetRkey, popoverId) {
    const preferred = localStorage.getItem(PREF_KEY);
    const popover = document.createElement("div");
    popover.id = popoverId;
    popover.setAttribute("popover", "");
    popover.className = "atproto-app-popover";

    for (const app of KNOWN_APPS) {
      const a = document.createElement("a");
      a.href = `https://${app.domain}/profile/${targetDid}/post/${targetRkey}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = app.label;
      a.className = "atproto-app-popover__link" +
        (preferred === app.domain ? " atproto-app-popover__link--active" : "");
      a.addEventListener("click", () => {
        localStorage.setItem(PREF_KEY, app.domain);
        popover.hidePopover?.();
      });
      popover.appendChild(a);
    }

    // Custom domain row
    const customLabel = lang === "pt" ? "Outra app" : "Other app";
    const separator = document.createElement("div");
    separator.className = "atproto-app-popover__separator";
    separator.textContent = customLabel;
    popover.appendChild(separator);

    const customWrap = document.createElement("div");
    customWrap.className = "atproto-app-popover__custom";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "mi-app.social";
    input.className = "atproto-app-popover__input";
    // Pre-fill if saved preference is a custom domain
    if (preferred && !KNOWN_DOMAINS.has(preferred)) input.value = preferred;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "→";
    btn.className = "atproto-app-popover__go";

    function openCustom() {
      const domain = input.value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (!domain) return;
      localStorage.setItem(PREF_KEY, domain);
      window.open(`https://${domain}/profile/${targetDid}/post/${targetRkey}`, "_blank", "noopener,noreferrer");
      popover.hidePopover?.();
    }

    btn.addEventListener("click", openCustom);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") openCustom(); });

    customWrap.appendChild(input);
    customWrap.appendChild(btn);
    popover.appendChild(customWrap);

    return popover;
  }

  // Task 4.2 — trigger button
  function buildAppButton(label, popoverId, extraClass) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("popovertarget", popoverId);
    btn.className = "atproto-app-btn" + (extraClass ? ` ${extraClass}` : "");
    btn.textContent = label;
    return btn;
  }

  // Tasks 4.6 / 4.7 — wrapper combining button + popover
  function buildAppAction(label, targetDid, targetRkey, btnClass) {
    const id = `atproto-pop-${++popoverCounter}`;
    const wrap = document.createElement("div");
    wrap.className = "atproto-app-action";
    const btn = buildAppButton(label, id, btnClass);
    const popover = buildAppPopover(targetDid, targetRkey, id);

    // Anchor popover below its trigger button when it opens
    popover.addEventListener("toggle", (e) => {
      if (e.newState !== "open") return;
      const rect = btn.getBoundingClientRect();
      const gap = 4;
      popover.style.margin = "0";
      popover.style.top = `${rect.bottom + gap}px`;
      // Clamp left so popover doesn't overflow the viewport
      const popoverWidth = popover.offsetWidth || 160;
      const left = Math.min(rect.left, window.innerWidth - popoverWidth - gap);
      popover.style.left = `${Math.max(gap, left)}px`;
    });

    wrap.appendChild(btn);
    wrap.appendChild(popover);
    return wrap;
  }

  function buildFacetedText(record) {
    const text = record.text || "";
    const facets = record.facets || [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

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
        fragment.appendChild(document.createTextNode(decoder.decode(bytes.slice(pos, link.start))));
      }
      const a = document.createElement("a");
      a.href = link.uri;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      a.textContent = decoder.decode(bytes.slice(link.start, link.end));
      fragment.appendChild(a);
      pos = link.end;
    }
    if (pos < bytes.length) {
      fragment.appendChild(document.createTextNode(decoder.decode(bytes.slice(pos))));
    }
    return fragment;
  }

  // Tasks 1.1–1.6, 3.1–3.4, 4.7, 5.3
  function renderReply(view, hidden) {
    if (view.$type === "app.bsky.feed.defs#blockedPost") return null;
    if (view.$type !== "app.bsky.feed.defs#threadViewPost") return null;

    const rkey = view.post?.uri?.split("/").pop();
    if (hidden.has(rkey)) return null;
    if (isHiddenByLabel(view.post?.labels)) return null;

    const post = view.post;
    const author = post?.author || {};
    const record = post?.record || {};

    // Task 1.2 — <li><article>
    const li = document.createElement("li");
    const item = document.createElement("article");
    item.className = "atproto-reply";
    li.appendChild(item);

    // Task 3.1 — avatar wrap
    item.appendChild(buildAvatarWrap(author));

    // Task 2.3 — content wrapper
    const content = document.createElement("div");
    content.className = "atproto-reply__content";

    // Task 1.3 — <header>
    const header = document.createElement("header");
    header.className = "atproto-reply__header";

    // Task 1.4 — <b> for author name
    const name = document.createElement("b");
    name.className = "atproto-reply__author";
    name.textContent = author.displayName || author.handle || "Unknown";

    const handle = document.createElement("span");
    handle.className = "atproto-reply__handle";
    handle.textContent = "@" + (author.handle || "");

    // Tasks 5.3, 5.2 — relative time + title tooltip
    const time = document.createElement("time");
    time.className = "atproto-reply__time";
    time.dateTime = record.createdAt || "";
    time.textContent = "· " + (formatRelativeTime(record.createdAt || "", lang));
    time.title = formatAbsoluteDate(record.createdAt || "");

    header.appendChild(name);
    header.appendChild(handle);
    header.appendChild(time);
    content.appendChild(header);

    const body = document.createElement("p");
    body.className = "atproto-reply__text";
    body.appendChild(buildFacetedText(record));
    content.appendChild(body);

    // Task 1.5 — nested replies in <ol>
    const subReplies = (view.replies || [])
      .filter((r) => r.$type === "app.bsky.feed.defs#threadViewPost")
      .sort((a, b) => {
        const ta = new Date(a.post?.record?.createdAt || 0).getTime();
        const tb = new Date(b.post?.record?.createdAt || 0).getTime();
        return ta - tb;
      });

    // Task 4.7 — "Responder" button per reply
    const authorDid = author.did;
    const replyRkey = post?.uri?.split("/").pop();
    const replyLabel = lang === "pt" ? "Responder" : "Reply";
    content.appendChild(buildAppAction(replyLabel, authorDid, replyRkey));

    item.appendChild(content);

    if (subReplies.length > 0) {
      const subList = document.createElement("ol");
      subList.className = "atproto-reply__replies";
      for (const sub of subReplies) {
        const child = renderReply(sub, hidden);
        if (child) subList.appendChild(child);
      }
      if (subList.lastElementChild) {
        subList.lastElementChild.classList.add("atproto-reply__item--last");
      }
      item.appendChild(subList);
    }

    return li;
  }

  function renderError() {
    const div = document.createElement("div");
    div.className = "atproto-comments__error";
    div.textContent = lang === "pt"
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
      container.appendChild(renderError());
      return;
    }

    const thread = data.thread;
    const commentLabel = lang === "pt" ? "Comentar" : "Comment";

    if (!thread ||
        thread.$type === "app.bsky.feed.defs#notFoundPost" ||
        thread.$type === "app.bsky.feed.defs#blockedPost") {
      container.appendChild(buildAppAction(commentLabel, rootDid, rootRkey, "atproto-app-btn--xl"));
      return;
    }

    const hidden = hiddenRkeys(thread);

    // Task 1.1 — root list is <ol>
    const replies = (thread.replies || [])
      .filter((r) => r.$type === "app.bsky.feed.defs#threadViewPost")
      .sort((a, b) => {
        const ta = new Date(a.post?.record?.createdAt || 0).getTime();
        const tb = new Date(b.post?.record?.createdAt || 0).getTime();
        return ta - tb;
      });

    if (replies.length === 0) {
      container.appendChild(buildAppAction(commentLabel, rootDid, rootRkey, "atproto-app-btn--xl"));
      return;
    }

    const list = document.createElement("ol");
    list.className = "atproto-comments__list";
    for (const reply of replies) {
      const el = renderReply(reply, hidden);
      if (el) list.appendChild(el);
    }
    container.appendChild(list);

    // Task 4.6 — "Comentar" button at the bottom of the list
    container.appendChild(buildAppAction(commentLabel, rootDid, rootRkey, "atproto-app-btn--xl"));
  }

  load();
})();
