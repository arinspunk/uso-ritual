import lume from "lume/mod.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import date from "lume/plugins/date.ts";
import feed from "lume/plugins/feed.ts";
import transformImages from "lume/plugins/transform_images.ts";
import {
  renderPostAudio,
  renderPostGallery,
  renderPostImage,
  renderPostQuote,
  renderPostVideo,
} from "./media_shortcodes.ts";

const site = lume({
  src: "./src",
  // Atualiza este URL com o domínio definitivo antes do primeiro deploy
  location: new URL("https://uso-ritual.netlify.app"),
});

// Corre ANTES do multilanguage plugin:
// 1. Define URL a partir do slug para posts (plugin aplica /en/ a EN depois)
// 2. Mapeia translationKey → id para o plugin construir os alternates
site.preprocess([".md"], (pages) => {
  for (const page of pages) {
    if (page.data.type === "post" && page.data.slug) {
      page.data.url = `/${page.data.slug}/`;
    }
    if (page.data.translationKey && !page.data.id) {
      page.data.id = page.data.translationKey;
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

// ─── Shortcodes de media para posts ───
// Locked author syntax (Vento filters — multi-arg tags are not parseable):
//   {{ "src" |> postImage("alt", "caption?", "wide|full|text?") }}
//   {{ "url" |> postVideo("caption?", "wide|full|text?") }}
//   {{ "url" |> postAudio("caption?") }}
//   {{ "src|alt|cap" |> postGallery("src|alt|cap", ...) }}
//   {{ "texto" |> postQuote("atribución?") }}
// Markup source of truth: src/_includes/partials/post-media.vto (mirrored in media_shortcodes.ts).
// Raster image src: JPG/JPEG/PNG → .webp via resolveImageSrc (transform_images); SVG unchanged.

site.filter("postImage", renderPostImage);
site.filter("postVideo", renderPostVideo);
site.filter("postAudio", renderPostAudio);
site.filter("postGallery", renderPostGallery);
site.filter("postQuote", renderPostQuote);

site.copy("assets/css");
site.copy("assets/fonts");
site.loadAssets([".svg"]);
site.use(transformImages());

export default site;
