export const url = "/.well-known/site.standard.publication";

export default function ({ atproto }: Lume.Data) {
  return `at://${atproto.did}/site.standard.publication/${atproto.publication.rkey}`;
}
