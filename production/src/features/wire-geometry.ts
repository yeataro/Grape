/** Display geometry only: ordered endpoints remain the caller's authority. */
export function wireCurve(
  from: readonly [number, number],
  to: readonly [number, number],
  direction = 1,
): string {
  const extent = Math.max(
    24,
    Math.abs(to[0] - from[0]) / 2,
    Math.abs(to[1] - from[1]) / 4,
  );
  return `M ${from[0]} ${from[1]} C ${from[0] + extent * direction} ${from[1]}, ${to[0] - extent * direction} ${to[1]}, ${to[0]} ${to[1]}`;
}
