(function () {
  const container = document.querySelector(".post-comments[data-thread-uri]");
  if (!container) return;

  const threadUri = container.dataset.threadUri;
  const DEFAULT_APPVIEW = "https://public.api.bsky.app";
  const appview = (container.dataset.appview || DEFAULT_APPVIEW).replace(/\/+$/, "");
  const lang = document.documentElement.lang || "en";

  // at://did/app.bsky.feed.post/rkey
  const uriParts = threadUri.split("/");
  const rootDid = uriParts[2];
  const rootRkey = uriParts[4];

  // --- Constants & i18n ---
  const I18N = {
    pt: {
      reply: "Responder",
      replyTo: "Responder a {name}",
      comment: "Comentar",
      otherApp: "Outra app",
      inputPlaceholder: "app.example",
      error: "Não foi possível carregar os comentários.",
      now: "agora",
      minutes: "min",
      hours: "h",
      days: "d",
      months: "m",
      viewMore: "Ver mais no Bluesky",
      invalidDomain: "Domínio inválido",
    },
    en: {
      reply: "Reply",
      replyTo: "Reply to {name}",
      comment: "Comment",
      otherApp: "Other app",
      inputPlaceholder: "app.example",
      error: "Comments couldn't be loaded.",
      now: "now",
      minutes: "m",
      hours: "h",
      days: "d",
      months: "mo",
      viewMore: "View more on Bluesky",
      invalidDomain: "Invalid domain",
    },
  };

  function t(key, vars) {
    const dict = I18N[lang] ?? I18N.en;
    let str = dict[key] ?? I18N.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, v);
      }
    }
    return str;
  }

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
  const MAX_DEPTH = 6;
  const SUPPORTS_POPOVER = "popover" in HTMLElement.prototype;

  let popoverCounter = 0;

  // --- Pure utilities ---
  function isValidDate(iso) {
    return !Number.isNaN(new Date(iso).getTime());
  }

  function formatRelativeTime(iso) {
    if (!isValidDate(iso)) return "";
    const delta = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (delta < 60) return t("now");
    if (delta < 3600) return `${Math.floor(delta / 60)} ${t("minutes")}`;
    if (delta < 86400) return `${Math.floor(delta / 3600)} ${t("hours")}`;
    if (delta < 2592000) return `${Math.floor(delta / 86400)} ${t("days")}`;
    if (delta < 31536000) return `${Math.floor(delta / 2592000)} ${t("months")}`;
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }

  function formatAbsoluteDate(iso) {
    if (!isValidDate(iso)) return "";
    try {
      return new Intl.DateTimeFormat(lang, { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
    } catch (_) {
      return iso;
    }
  }

  function getInitials(displayName, handle) {
    const src = (displayName && displayName.trim()) ? displayName.trim() : (handle || "");
    const words = src.split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    const first = [...words[0]][0] || "";
    const second = words.length > 1 ? ([...words[1]][0] || "") : "";
    return (first + second).toUpperCase();
  }

  function normalizeDomain(raw) {
    if (typeof raw !== "string") return null;
    const value = raw.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (!value || /\s/.test(value)) return null;
    try {
      const url = new URL("https://" + value);
      if (url.pathname !== "/" || url.search || !url.hostname.includes(".")) return null;
      return url.hostname;
    } catch (_) {
      return null;
    }
  }

  function isHiddenByLabel(labels) {
    if (!Array.isArray(labels)) return false;
    return labels.some((l) => HIDE_LABELS.has(l.val));
  }

  function hiddenUris(thread) {
    return new Set(
      (thread.threadgate?.record?.hiddenReplies ?? [])
        .map((r) => r.uri)
        .filter(Boolean),
    );
  }

  function sortedReplies(list) {
    return (list || [])
      .filter((r) => r.$type === "app.bsky.feed.defs#threadViewPost")
      .sort((a, b) => {
        const ta = new Date(a.post?.record?.createdAt || 0).getTime();
        const tb = new Date(b.post?.record?.createdAt || 0).getTime();
        return ta - tb;
      });
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
        } else if (feature.$type === "app.bsky.richtext.facet#mention" && feature.did) {
          links.push({
            start: facet.index.byteStart,
            end: facet.index.byteEnd,
            uri: `https://bsky.app/profile/${feature.did}`,
          });
        } else if (feature.$type === "app.bsky.richtext.facet#tag" && feature.tag) {
          links.push({
            start: facet.index.byteStart,
            end: facet.index.byteEnd,
            uri: `https://bsky.app/hashtag/${encodeURIComponent(feature.tag)}`,
          });
        }
      }
    }
    links.sort((a, b) => a.start - b.start);

    const fragment = document.createDocumentFragment();
    const decoder = new TextDecoder();
    let pos = 0;

    for (const link of links) {
      if (link.start < pos || link.end <= link.start || link.end > bytes.length) continue;
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

  // --- DOM builders ---
  function buildPlaceholder(author) {
    const div = document.createElement("div");
    div.className = "atproto-reply__avatar atproto-reply__avatar--placeholder";
    div.textContent = getInitials(author.displayName, author.handle);
    return div;
  }

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
      img.onerror = () => img.replaceWith(buildPlaceholder(author));
      wrap.appendChild(img);
    } else {
      wrap.appendChild(buildPlaceholder(author));
    }
    return wrap;
  }

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

    const separator = document.createElement("div");
    separator.className = "atproto-app-popover__separator";
    separator.textContent = t("otherApp");
    popover.appendChild(separator);

    const customWrap = document.createElement("div");
    customWrap.className = "atproto-app-popover__custom";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = t("inputPlaceholder");
    input.className = "atproto-app-popover__input";
    if (preferred && !KNOWN_DOMAINS.has(preferred)) input.value = preferred;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "→";
    btn.className = "atproto-app-popover__go";

    function openCustom() {
      const domain = normalizeDomain(input.value);
      if (!domain) {
        input.setAttribute("aria-invalid", "true");
        return;
      }
      input.removeAttribute("aria-invalid");
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

  function buildAppButton(label, popoverId, extraClass, ariaLabel) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("popovertarget", popoverId);
    btn.setAttribute("aria-haspopup", "true");
    btn.className = "atproto-app-btn" + (extraClass ? ` ${extraClass}` : "");
    btn.textContent = label;
    if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
    return btn;
  }

  function buildAppAction(label, targetDid, targetRkey, btnClass, ariaLabel) {
    const wrap = document.createElement("div");
    wrap.className = "atproto-app-action";

    if (!SUPPORTS_POPOVER) {
      const a = document.createElement("a");
      a.className = "atproto-app-btn" + (btnClass ? ` ${btnClass}` : "");
      a.href = `https://bsky.app/profile/${targetDid}/post/${targetRkey}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = label;
      if (ariaLabel) a.setAttribute("aria-label", ariaLabel);
      wrap.appendChild(a);
      return wrap;
    }

    const id = `atproto-pop-${++popoverCounter}`;
    const btn = buildAppButton(label, id, btnClass, ariaLabel);
    const popover = buildAppPopover(targetDid, targetRkey, id);

    let onScroll = null;
    let onResize = null;

    const close = () => popover.hidePopover?.();

    popover.addEventListener("toggle", (e) => {
      if (e.newState === "open") {
        const preferred = localStorage.getItem(PREF_KEY);
        for (const a of popover.querySelectorAll(".atproto-app-popover__link")) {
          let hostname = "";
          try {
            hostname = new URL(a.href).hostname;
          } catch (_) { /* ignore */ }
          a.classList.toggle("atproto-app-popover__link--active", hostname === preferred);
        }
        const input = popover.querySelector(".atproto-app-popover__input");
        if (input) {
          input.value = preferred && !KNOWN_DOMAINS.has(preferred) ? preferred : "";
        }

        const rect = btn.getBoundingClientRect();
        const gap = 4;
        const height = popover.offsetHeight;
        const popoverWidth = popover.offsetWidth || 160;
        let top = rect.bottom + gap;
        if (rect.bottom + gap + height > window.innerHeight && rect.top - gap - height >= 0) {
          top = rect.top - gap - height;
        }
        popover.style.margin = "0";
        popover.style.top = `${top}px`;
        const left = Math.min(rect.left, window.innerWidth - popoverWidth - gap);
        popover.style.left = `${Math.max(gap, left)}px`;

        onScroll = close;
        onResize = close;
        window.addEventListener("scroll", onScroll, { passive: true, once: true });
        window.addEventListener("resize", onResize, { passive: true, once: true });
      } else if (e.newState === "closed") {
        if (onScroll) window.removeEventListener("scroll", onScroll);
        if (onResize) window.removeEventListener("resize", onResize);
        onScroll = null;
        onResize = null;
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(popover);
    return wrap;
  }

  function renderReply(view, hidden) {
    if (view.$type === "app.bsky.feed.defs#blockedPost") return null;
    if (view.$type !== "app.bsky.feed.defs#threadViewPost") return null;

    if (hidden.has(view.post?.uri)) return null;
    if (isHiddenByLabel(view.post?.labels)) return null;

    const post = view.post;
    const author = post?.author || {};
    const record = post?.record || {};

    const li = document.createElement("li");
    const item = document.createElement("article");
    item.className = "atproto-reply";
    li.appendChild(item);

    item.appendChild(buildAvatarWrap(author));

    const content = document.createElement("div");
    content.className = "atproto-reply__content";

    const header = document.createElement("header");
    header.className = "atproto-reply__header";

    const name = document.createElement("b");
    name.className = "atproto-reply__author";
    name.textContent = author.displayName || author.handle || "Unknown";

    const handle = document.createElement("span");
    handle.className = "atproto-reply__handle";
    handle.textContent = "@" + (author.handle || "");

    header.appendChild(name);
    header.appendChild(handle);

    if (isValidDate(record.createdAt)) {
      const time = document.createElement("time");
      time.className = "atproto-reply__time";
      time.dateTime = record.createdAt;
      time.textContent = formatRelativeTime(record.createdAt);
      time.title = formatAbsoluteDate(record.createdAt);
      header.appendChild(time);
    }

    content.appendChild(header);

    const body = document.createElement("p");
    body.className = "atproto-reply__text";
    body.appendChild(buildFacetedText(record));
    content.appendChild(body);

    const authorDid = author.did;
    const replyRkey = post?.uri?.split("/").pop();
    const replyAria = t("replyTo", { name: author.displayName || author.handle || "" });
    content.appendChild(buildAppAction(t("reply"), authorDid, replyRkey, undefined, replyAria));

    const loadedReplies = view.replies || [];
    if ((post.replyCount || 0) > loadedReplies.length) {
      const more = document.createElement("a");
      more.className = "atproto-reply__more";
      more.href = `https://bsky.app/profile/${authorDid}/post/${replyRkey}`;
      more.target = "_blank";
      more.rel = "noopener noreferrer";
      more.textContent = t("viewMore");
      content.appendChild(more);
    }

    item.appendChild(content);

    const subReplies = sortedReplies(view.replies);

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
    div.setAttribute("role", "status");
    div.textContent = t("error");
    return div;
  }

  // --- Bootstrap ---
  async function load() {
    const url = `${appview}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(threadUri)}&depth=${MAX_DEPTH}&parentHeight=0`;
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
    const commentLabel = t("comment");

    if (!thread ||
        thread.$type === "app.bsky.feed.defs#notFoundPost" ||
        thread.$type === "app.bsky.feed.defs#blockedPost") {
      container.appendChild(buildAppAction(commentLabel, rootDid, rootRkey, "atproto-app-btn--xl"));
      return;
    }

    const hidden = hiddenUris(thread);
    const replies = sortedReplies(thread.replies);

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

    container.appendChild(buildAppAction(commentLabel, rootDid, rootRkey, "atproto-app-btn--xl"));
  }

  load();
})();
