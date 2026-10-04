import type { Json, ContractIssue, ModuleRef } from "./public-surface.ts";
export class Fault extends Error {
  constructor(
    public readonly code: string,
    detail = code,
  ) {
    super(detail);
    this.name = code;
  }
}
export function demand(ok: unknown, code: string, detail?: string): asserts ok {
  if (!ok) throw new Fault(code, detail);
}
export function plain(value: unknown, depth = 0): asserts value is Json {
  demand(depth < 128, "JSON_DEPTH");
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return;
  if (typeof value === "number") {
    demand(Number.isFinite(value), "JSON_NUMBER");
    return;
  }
  demand(typeof value === "object", "JSON_VALUE");
  const array = Array.isArray(value);
  demand(
    Object.getPrototypeOf(value) ===
      (array ? Array.prototype : Object.prototype) ||
      (!array && Object.getPrototypeOf(value) === null),
    "JSON_PROTOTYPE",
  );
  const descriptors = Object.getOwnPropertyDescriptors(value);
  demand(
    Reflect.ownKeys(value).every((k) => typeof k === "string"),
    "JSON_SYMBOL",
  );
  if (array)
    demand(Object.keys(descriptors).length === value.length + 1, "JSON_ARRAY");
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (array && key === "length") continue;
    demand("value" in descriptor && descriptor.enumerable, "JSON_DESCRIPTOR");
    if (array)
      demand(
        /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length,
        "JSON_ARRAY",
      );
    plain(descriptor.value, depth + 1);
  }
}
export function detached<T>(value: T): T {
  const copy = structuredClone(value);
  const lock = (x: unknown) => {
    if (x && typeof x === "object") {
      Object.values(x).forEach(lock);
      Object.freeze(x);
    }
  };
  lock(copy);
  return copy;
}
export function equal(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
export function pinKey(p: ModuleRef): string {
  return JSON.stringify([p.moduleId, p.version, p.fingerprint]);
}
export function exact(a: ModuleRef, b: ModuleRef): boolean {
  return pinKey(a) === pinKey(b);
}
export class Signal<T = void> {
  #listeners = new Set<(value: T) => void>();
  readonly errors: unknown[] = [];
  notifying = false;
  subscribe(fn: (value: T) => void): () => void {
    this.#listeners.add(fn);
    return () => {
      this.#listeners.delete(fn);
    };
  }
  emit(value: T): void {
    const prior = this.notifying;
    this.notifying = true;
    try {
      for (const fn of [...this.#listeners])
        if (this.#listeners.has(fn)) {
          try {
            fn(value);
          } catch (error) {
            this.errors.push(error);
          }
        }
    } finally {
      this.notifying = prior;
    }
  }
  clear(): void {
    this.#listeners.clear();
  }
}
export interface IdentitySource {
  next(): string;
}
export function issue(
  code: string,
  message: string,
  subject?: ContractIssue["subject"],
  severity: "error" | "warning" = "error",
): ContractIssue {
  return {
    code,
    message,
    severity,
    messageRef: {
      owner: {
        moduleId: "grape.core",
        version: "0.1.0",
        fingerprint: "core-s01-v1",
        namespace: "grape.core",
        catalogVersion: 1,
      },
      key: code,
      fallback: message,
    },
    ...(subject ? { subject } : {}),
  };
}
