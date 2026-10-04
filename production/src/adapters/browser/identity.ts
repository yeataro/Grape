import { demand } from "../../sdk/kernel.ts";
import type { IdentitySource } from "../../sdk/kernel.ts";

/** UUIDv4 retains the existing spelling and 122 random bits on HTTP origins. */
export function browserIdentity(
  entropy: Pick<Crypto, "getRandomValues"> = globalThis.crypto,
): IdentitySource {
  return {
    next: () => {
      demand(
        entropy && typeof entropy.getRandomValues === "function",
        "SECURE_ENTROPY_UNAVAILABLE",
      );
      const bytes = new Uint8Array(16);
      entropy.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 15) | 64;
      bytes[8] = (bytes[8] & 63) | 128;
      const hex = [...bytes]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    },
  };
}
