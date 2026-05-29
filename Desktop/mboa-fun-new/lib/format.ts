// Deterministic number formatting (avoids SSR/CSR locale mismatch)
export function formatGems(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
