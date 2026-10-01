const BASE32_SORTABLE = "234567abcdefghijklmnopqrstuvwxyz";

export async function atprotoTid(
  slug: string,
  lang: string,
  date: Date | string,
): Promise<string> {
  const key = `${slug}-${lang}`;
  const keyBytes = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyBytes);
  const h = new Uint8Array(hashBuffer);

  // uint64_be(h[0..8]): read 8 bytes as unsigned 64-bit big-endian integer
  const uint64 =
    (BigInt(h[0]) << 56n) |
    (BigInt(h[1]) << 48n) |
    (BigInt(h[2]) << 40n) |
    (BigInt(h[3]) << 32n) |
    (BigInt(h[4]) << 24n) |
    (BigInt(h[5]) << 16n) |
    (BigInt(h[6]) << 8n) |
    BigInt(h[7]);

  const offsetUs = uint64 % 86_400_000_000n;
  const clockId = BigInt(((h[8] << 8) | h[9]) & 0x3ff);

  const d = typeof date === "string" ? new Date(date) : date;
  const dayStartMs = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  const dayStartUs = BigInt(dayStartMs) * 1000n;

  const tid = ((dayStartUs + offsetUs) << 10n) | clockId;

  let result = "";
  let n = tid;
  for (let i = 0; i < 13; i++) {
    result = BASE32_SORTABLE[Number(n & 31n)] + result;
    n >>= 5n;
  }
  return result;
}
