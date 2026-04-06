export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("pt-AO").format(value)} Kz`;
}
