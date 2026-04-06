const kwanzaFormatter = new Intl.NumberFormat("pt-AO");

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatPrice(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value ?? 0;

  return `${kwanzaFormatter.format(Number(numericValue ?? 0))} Kz`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sem data";
  }

  return dateFormatter.format(new Date(value));
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--:--";
  }

  return timeFormatter.format(new Date(value));
}

export function shortId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const sanitizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}
