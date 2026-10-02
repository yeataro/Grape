import { demand } from "./kernel.ts";

/**
 * A finite JS number becomes a GLSL floating constant (optionally negated).
 * Keep the decimal spelling/value; numeric type admission belongs to the caller.
 * A decimal point belongs to the significand, never after the exponent digits.
 */
export function glslFloatLiteral(value: unknown): string {
  demand(typeof value === "number" && Number.isFinite(value), "GLSL_LITERAL");
  const [mantissa, exponent] = String(value).split("e");
  const significand = mantissa.includes(".") ? mantissa : mantissa + ".0";
  return exponent === undefined ? significand : significand + "e" + exponent;
}
