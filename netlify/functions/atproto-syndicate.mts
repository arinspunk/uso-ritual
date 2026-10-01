import type { DeploySucceededEvent, NetlifyFunction } from "@netlify/functions";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ManifestEntry {
  rkey: string;
  slug: string;
  lang: string;
  title: string;
  description: string;
  path: string;
  url: string;
  publishedAt: string;
  updatedAt: string | null;
  tags: string[];
  textContent: string;
  anchor: boolean;
}

interface Manifest {
  did: string;
  publication: {
    rkey: string;
    url: string;
    name: string;
    description: string;
  };
  entries: ManifestEntry[];
}

interface StrongRef {
  uri: string;
  cid: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DRY_RUN = Netlify.env.get("ATPROTO_DRY_RUN") === "true";

function truncateToGraphemes(text: string, max: number): string {
  const seg = new Intl.Segmenter();
  const chars = [...seg.segment(text)];
  if (chars.length <= max) return text;
  return chars.slice(0, max).map((s) => s.segment).join("");
}

async function resolvePds(did: string): Promise<string> {
  const override = Netlify.env.get("ATPROTO_PDS_URL");
  if (override) return override;

  const res = await fetch(`https://plc.directory/${did}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`plc.directory ${res.status}`);
  const doc = await res.json();
  const service = doc.service?.find(
    (s: { id: string }) => s.id === "#atproto_pds",
  );
  if (!service?.serviceEndpoint) {
    throw new Error("No #atproto_pds service in DID document");
  }
  return service.serviceEndpoint as string;
}

async function createSession(
  pds: string,
  did: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: did, password }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createSession ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.accessJwt as string;
}

async function getRecord(
  pds: string,
  jwt: string,
  repo: string,
  collection: string,
  rkey: string,
): Promise<{ uri: string; cid: string; value: Record<string, unknown> } | null> {
  const url =
    `${pds}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(repo)}&collection=${encodeURIComponent(collection)}&rkey=${encodeURIComponent(rkey)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
    signal: AbortSignal.timeout(10_000),
  });
  // 404 = not found; 400 = Eurosky PDS rejects getRecord for unknown Lexicons (treat as not found)
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`getRecord ${collection}/${rkey}: ${res.status}`);
  return await res.json();
}

async function putRecord(
  pds: string,
  jwt: string,
  repo: string,
  collection: string,
  rkey: string,
  record: Record<string, unknown>,
): Promise<{ uri: string; cid: string }> {
  if (DRY_RUN) {
    console.log(`[dry-run] putRecord ${collection}/${rkey}`);
    return { uri: `at://${repo}/${collection}/${rkey}`, cid: "dry-run" };
  }
  const res = await fetch(`${pds}/xrpc/com.atproto.repo.putRecord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ repo, collection, rkey, record }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`putRecord ${collection}/${rkey}: ${res.status}: ${body}`);
  }
  return await res.json();
}

async function createRecord(
  pds: string,
  jwt: string,
  repo: string,
  collection: string,
  rkey: string,
  record: Record<string, unknown>,
): Promise<{ uri: string; cid: string }> {
  if (DRY_RUN) {
    console.log(`[dry-run] createRecord ${collection}/${rkey}`);
    return { uri: `at://${repo}/${collection}/${rkey}`, cid: "dry-run" };
  }
  const res = await fetch(`${pds}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ repo, collection, rkey, record }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createRecord ${collection}/${rkey}: ${res.status}: ${body}`);
  }
  return await res.json();
}

// Deep-compare only the managed fields of a document record
function documentDiffers(
  existing: Record<string, unknown>,
  desired: Record<string, unknown>,
): boolean {
  const fields = [
    "$type",
    "site",
    "title",
    "path",
    "description",
    "publishedAt",
    "updatedAt",
    "tags",
    "textContent",
    "bskyPostRef",
  ];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify(desired[f])) return true;
  }
  return false;
}

function publicationDiffers(
  existing: Record<string, unknown>,
  desired: Record<string, unknown>,
): boolean {
  const fields = ["$type", "url", "name", "description"];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify(desired[f])) return true;
  }
  return false;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
  async deploySucceeded(event: DeploySucceededEvent) {
    // 4.2: only run for production deploys
    const context = event.deploy.context;
    console.log(`[atproto-syndicate] deploy context: ${context}`);
    if (context !== "production") {
      console.log("[atproto-syndicate] skipping non-production deploy");
      return;
    }

    const password = Netlify.env.get("ATPROTO_APP_PASSWORD");
    if (!password) {
      console.error("[atproto-syndicate] ATPROTO_APP_PASSWORD not set");
      return;
    }

    // 4.3: fetch manifest from the permalink URL of this deploy
    const manifestUrl = `${event.deploy.permalinkUrl}/atproto/manifest.json`;
    console.log(`[atproto-syndicate] fetching manifest: ${manifestUrl}`);
    const manifestRes = await fetch(manifestUrl, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!manifestRes.ok) {
      console.error(
        `[atproto-syndicate] failed to fetch manifest: ${manifestRes.status}`,
      );
      return;
    }
    const manifest: Manifest = await manifestRes.json();
    const { did, publication, entries } = manifest;

    // 4.4: resolve PDS
    let pds: string;
    try {
      pds = await resolvePds(did);
      console.log(`[atproto-syndicate] PDS: ${pds}`);
    } catch (err) {
      console.error(`[atproto-syndicate] failed to resolve PDS: ${err}`);
      return;
    }

    // 4.5: authenticate
    let jwt: string;
    try {
      jwt = await createSession(pds, did, password);
      console.log("[atproto-syndicate] authenticated");
    } catch (err) {
      console.error(`[atproto-syndicate] authentication failed: ${err}`);
      return;
    }

    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let errors = 0;

    // 4.6: sync publication record
    try {
      const pubUri = `at://${did}/site.standard.publication/${publication.rkey}`;
      const desiredPub = {
        "$type": "site.standard.publication",
        url: publication.url,
        name: publication.name,
        description: publication.description,
      };
      const existingPub = await getRecord(
        pds,
        jwt,
        did,
        "site.standard.publication",
        publication.rkey,
      );
      if (!existingPub) {
        await putRecord(
          pds,
          jwt,
          did,
          "site.standard.publication",
          publication.rkey,
          desiredPub,
        );
        console.log(`[atproto-syndicate] publication created: ${pubUri}`);
        created++;
      } else if (publicationDiffers(existingPub.value, desiredPub)) {
        await putRecord(
          pds,
          jwt,
          did,
          "site.standard.publication",
          publication.rkey,
          desiredPub,
        );
        console.log(`[atproto-syndicate] publication updated: ${pubUri}`);
        updated++;
      } else {
        console.log(`[atproto-syndicate] publication unchanged`);
        unchanged++;
      }
    } catch (err) {
      console.error(`[atproto-syndicate] publication sync error: ${err}`);
      errors++;
    }

    const pubAtUri =
      `at://${did}/site.standard.publication/${publication.rkey}`;

    // Process each entry
    for (const entry of entries) {
      try {
        let bskyPostRef: StrongRef | undefined;

        // 4.7: handle anchor posts
        if (entry.anchor) {
          const existing = await getRecord(
            pds,
            jwt,
            did,
            "app.bsky.feed.post",
            entry.rkey,
          );
          if (existing) {
            bskyPostRef = { uri: existing.uri, cid: existing.cid };
            console.log(
              `[atproto-syndicate] anchor already exists: ${existing.uri}`,
            );
          } else {
            // D6: create anchor post
            const anchorRecord = {
              "$type": "app.bsky.feed.post",
              text: truncateToGraphemes(entry.title, 300),
              langs: [entry.lang],
              createdAt: new Date().toISOString(),
              embed: {
                "$type": "app.bsky.embed.external",
                external: {
                  uri: entry.url,
                  title: entry.title,
                  description: entry.description,
                },
              },
            };
            const ref = await createRecord(
              pds,
              jwt,
              did,
              "app.bsky.feed.post",
              entry.rkey,
              anchorRecord,
            );
            bskyPostRef = ref;
            console.log(
              `[atproto-syndicate] anchor created: ${ref.uri}`,
            );
            created++;
          }
        }

        // 4.8: sync document
        const desiredDoc: Record<string, unknown> = {
          "$type": "site.standard.document",
          site: pubAtUri,
          title: entry.title,
          path: entry.path,
          description: entry.description,
          publishedAt: entry.publishedAt,
          tags: entry.tags,
          textContent: entry.textContent,
        };
        if (entry.updatedAt) desiredDoc.updatedAt = entry.updatedAt;
        if (bskyPostRef) desiredDoc.bskyPostRef = bskyPostRef;

        const existingDoc = await getRecord(
          pds,
          jwt,
          did,
          "site.standard.document",
          entry.rkey,
        );
        if (!existingDoc) {
          await putRecord(
            pds,
            jwt,
            did,
            "site.standard.document",
            entry.rkey,
            desiredDoc,
          );
          console.log(
            `[atproto-syndicate] document created: ${entry.rkey} (${entry.lang})`,
          );
          created++;
        } else if (documentDiffers(existingDoc.value, desiredDoc)) {
          await putRecord(
            pds,
            jwt,
            did,
            "site.standard.document",
            entry.rkey,
            desiredDoc,
          );
          console.log(
            `[atproto-syndicate] document updated: ${entry.rkey} (${entry.lang})`,
          );
          updated++;
        } else {
          console.log(
            `[atproto-syndicate] document unchanged: ${entry.rkey} (${entry.lang})`,
          );
          unchanged++;
        }
      } catch (err) {
        // 4.9: capture per-entry errors, continue
        console.error(
          `[atproto-syndicate] error on ${entry.rkey} (${entry.lang}): ${err}`,
        );
        errors++;
      }
    }

    // 4.9: summary
    console.log(
      `[atproto-syndicate] done — created: ${created}, updated: ${updated}, unchanged: ${unchanged}, errors: ${errors}`,
    );
  },
} satisfies NetlifyFunction;
