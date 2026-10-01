import lume from "lume/mod.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import date from "lume/plugins/date.ts";
import feed from "lume/plugins/feed.ts";
import transformImages from "lume/plugins/transform_images.ts";
// Pin npm:napi-wasm so LightningCSS resolves on Netlify (Deno does not hoist nested deps).
import "napi-wasm";
import lightningCss from "lume/plugins/lightningcss.ts";
import { atprotoTid } from "./src/_lib/atproto-tid.ts";
import {
  renderPostAudio,
  renderPostGallery,
  renderPostImage,
  renderPostQuote,
  renderPostVideo,
  resolveImageSrc,
} from "./media_shortcodes.ts";

const site = lume({
  src: "./src",
  location: new URL("https://usoritual.com"),
});

// Corre ANTES do multilanguage plugin:
// 1. Define URL a partir do slug para posts (plugin aplica /en/ a EN depois)
// 2. Mapeia translationKey → id para o plugin construir os alternates
// 3. Calcula o rkey AT Protocol para posts (determinista: slug + lang + date)
site.preprocess([".md"], async (pages) => {
  for (const page of pages) {
    if (page.data.type === "post" && page.data.slug) {
      page.data.url = `/${page.data.slug}/`;
    }
    if (page.data.translationKey && !page.data.id) {
      page.data.id = page.data.translationKey;
    }
    if (
      page.data.type === "post" &&
      page.data.slug &&
      page.data.lang &&
      page.data.date
    ) {
      page.data.atprotoRkey = await atprotoTid(
        page.data.slug,
        page.data.lang,
        page.data.date,
      );
      const anchorSince = page.data.atproto?.anchorSince
        ? new Date(page.data.atproto.anchorSince as string)
        : new Date("2099-01-01");
      page.data.atprotoAnchor =
        new Date(page.data.date as Date) >= anchorSince;
    }
  }
});

site.use(multilanguage({
  languages: ["pt", "en"],
  defaultLanguage: "pt",
}));

site.use(date());

// Feed RSS em português
site.use(feed({
  output: ["/pt/feed.xml"],
  query: "lang=pt type=post",
  info: {
    title: "Uso Ritual",
    description: "Blogue editorial de música",
    lang: "pt",
  },
  items: {
    title: "=title",
    description: "=description",
    date: "=date",
    url: "=url",
  },
}));

// Feed RSS em inglês
site.use(feed({
  output: ["/en/feed.xml"],
  query: "lang=en type=post",
  info: {
    title: "Uso Ritual",
    description: "Music editorial blog",
    lang: "en",
  },
  items: {
    title: "=title",
    description: "=description",
    date: "=date",
    url: "=url",
  },
}));

// Formata datas usando a API nativa Intl, sem dependências externas
site.filter("formatDate", (value: Date, lang: string) => {
  const locale = lang === "pt" ? "pt-PT" : lang === "eu" ? "eu" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
});

// ─── AT Protocol helpers ───
const ATPROTO_DID = "did:plc:t3q3ylsnsser3o74xz42sdqk";

site.filter("atprotoDocUri", (rkey: string) =>
  `at://${ATPROTO_DID}/site.standard.document/${rkey}`);
site.filter("atprotoPostUri", (rkey: string) =>
  `at://${ATPROTO_DID}/app.bsky.feed.post/${rkey}`);
site.filter("bskyPostUrl", (rkey: string) =>
  `https://bsky.app/profile/${ATPROTO_DID}/post/${rkey}`);

// ─── Shortcodes de media para posts ───
// Locked author syntax (Vento filters — multi-arg tags are not parseable):
//   {{ "src" |> postImage("alt", "caption?", "wide|full|text?") }}
//   {{ "url" |> postVideo("caption?", "wide|full|text?") }}
//   {{ "url" |> postAudio("caption?") }}
//   {{ "src|alt|cap" |> postGallery("src|alt|cap", ...) }}
//   {{ "texto" |> postQuote("atribución?") }}
// Markup source of truth: src/_includes/partials/post-media.vto (mirrored in media_shortcodes.ts).
// Raster image src: JPG/JPEG/PNG → .webp via resolveImageSrc (transform_images); SVG unchanged.

site.filter("resolveImageSrc", resolveImageSrc);
site.filter("postImage", renderPostImage);
site.filter("postVideo", renderPostVideo);
site.filter("postAudio", renderPostAudio);
site.filter("postGallery", renderPostGallery);
site.filter("postQuote", renderPostQuote);

site.use(lightningCss());
site.copy("assets/fonts");
site.copy("assets/js");
site.copy(".well-known");
site.loadAssets([".svg"]);
site.use(transformImages());

export default site;
