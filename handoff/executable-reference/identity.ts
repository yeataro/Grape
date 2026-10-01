/** Runtime capability, never graph data or an authentication credential source. */
export interface IdentitySource {
  newId(): string;
}

export const webIdentity: IdentitySource = Object.freeze({
  newId(): string {
    if (!globalThis.crypto?.randomUUID)
      throw new Error(
        "IDENTITY_UNAVAILABLE: provide an IdentitySource at bootstrap",
      );
    return globalThis.crypto.randomUUID();
  },
});

/** Capture the implementation once; mutating the caller's descriptor cannot rebind it. */
export function captureIdentity(
  source: IdentitySource = webIdentity,
): IdentitySource {
  const allocate = source.newId.bind(source);
  return Object.freeze({
    newId(): string {
      const id = allocate();
      if (typeof id !== "string" || !id.length)
        throw new Error("IDENTITY_INVALID: expected a nonempty unique ID");
      return id;
    },
  });
}
