export function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatNio(value: number): string {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
  }).format(value);
}
