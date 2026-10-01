import { assertEquals, assertMatch } from "jsr:@std/assert";
import { atprotoTid } from "./atproto-tid.ts";

const BASE32_SORTABLE_RE = /^[234567abcdefghijklmnopqrstuvwxyz]{13}$/;

Deno.test("D2 vector: primeiro-post pt 2026-09-28", async () => {
  assertEquals(await atprotoTid("primeiro-post", "pt", "2026-09-28"), "3mwmg4egpd2mi");
});

Deno.test("D2 vector: primeiro-post en 2026-09-28", async () => {
  assertEquals(await atprotoTid("primeiro-post", "en", "2026-09-28"), "3mwmajpazxbxw");
});

Deno.test("D2 vector: nuevo-disco pt 2025-01-15T18:30:00Z (hora ignorada)", async () => {
  assertEquals(await atprotoTid("nuevo-disco", "pt", "2025-01-15T18:30:00Z"), "3lfqjhcifbbqb");
});

Deno.test("La hora de la fecha no afecta al rkey", async () => {
  const a = await atprotoTid("nuevo-disco", "pt", "2025-01-15");
  const b = await atprotoTid("nuevo-disco", "pt", "2025-01-15T18:30:00Z");
  assertEquals(a, b);
});

Deno.test("El rkey es un TID válido (13 chars, alfabeto base32-sortable)", async () => {
  const rkey = await atprotoTid("primeiro-post", "pt", "2026-09-28");
  assertMatch(rkey, BASE32_SORTABLE_RE);
  // primer carácter debe estar en 234567abcdefghij (valor < 16 en base32-sortable)
  const firstChar = rkey[0];
  const validFirstChars = new Set("234567abcdefghij");
  assertEquals(validFirstChars.has(firstChar), true, `Primer carácter '${firstChar}' fuera del rango esperado`);
});

Deno.test("Cada idioma tiene su propio rkey", async () => {
  const pt = await atprotoTid("primeiro-post", "pt", "2026-09-28");
  const en = await atprotoTid("primeiro-post", "en", "2026-09-28");
  assertEquals(pt !== en, true);
});
