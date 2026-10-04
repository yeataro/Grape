import { sha256 } from "@noble/hashes/sha2.js";

/** Portable SHA-256 over exact bytes; identical on secure and ordinary HTTP origins. */
export function sha256Digest(bytes: Uint8Array): string {
  return [...sha256(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
