import {
  DELIVERY_OPTIONS,
  PACK_SIZES,
  PRODUCTS,
  type DeliveryId,
} from "./menu";

export type OrderLine = { productId: string; sizeId: string; qty: number };

export type Order = {
  code: string;
  items: OrderLine[];
  name: string;
  phone: string;
  delivery: DeliveryId;
  address: string;
  notes: string;
};

const MAX_LINES = 20;
const MAX_QTY = 50;

export function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alike characters
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `UM-${out}`;
}

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}

function findOffer(line: OrderLine) {
  const product = PRODUCTS.find((x) => x.id === line.productId);
  const offer = product?.sizes.find((z) => z.sizeId === line.sizeId);
  return { product, offer };
}

export function lineLabel(line: OrderLine): string {
  const { product, offer } = findOffer(line);
  const size = PACK_SIZES.find((x) => x.id === line.sizeId);
  const detail = offer?.detail ? ` (${offer.detail})` : "";
  return `${product?.name ?? line.productId} – ${size?.name ?? line.sizeId}${detail}`;
}

export function linePrice(line: OrderLine): number | null {
  const { offer } = findOffer(line);
  return offer ? offer.price : null;
}

/** Items total in naira; null when the order is empty or has an unknown item. */
export function estimateTotal(items: OrderLine[]): number | null {
  if (items.length === 0) return null;
  let total = 0;
  for (const line of items) {
    const price = linePrice(line);
    if (price === null) return null;
    total += price * line.qty;
  }
  return total;
}

export function deliveryLabel(id: DeliveryId): string {
  return DELIVERY_OPTIONS.find((d) => d.id === id)?.label ?? id;
}

/** The order details, shared by the WhatsApp message and the Telegram alert. */
export function buildOrderBody(order: Order): string {
  const lines = order.items.map((l) => `• ${l.qty} × ${lineLabel(l)}`);
  const total = estimateTotal(order.items);
  const parts = [lines.join("\n")];
  if (total !== null) {
    parts.push(`Items total: ${formatNaira(total)} (delivery fee not included)`);
  }
  const details = [
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Delivery: ${deliveryLabel(order.delivery)}`,
  ];
  if (order.delivery === "delivery" && order.address) {
    details.push(`Address: ${order.address}`);
  }
  if (order.notes) details.push(`Notes: ${order.notes}`);
  parts.push(details.join("\n"));
  parts.push(`Order code: ${order.code}`);
  return parts.join("\n\n");
}

export function buildWhatsAppText(order: Order): string {
  return `Hello UMARR Essentials, I'd like to order:\n\n${buildOrderBody(order)}`;
}

export function buildTelegramText(order: Order): string {
  return `New order ${order.code}\n\n${buildOrderBody(order)}`;
}

export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Strips spaces, dashes and brackets; keeps a leading + if present. */
export function cleanPhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

export type FieldErrors = Partial<
  Record<"items" | "name" | "phone" | "address" | "notes", string>
>;

/** Shared by the form (instant feedback) and the API (never trust the client). */
export function validateOrder(
  raw: unknown,
): { ok: true; order: Order } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const r = (raw ?? {}) as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(r.name);
  const phone = cleanPhone(str(r.phone));
  const address = str(r.address);
  const notes = str(r.notes);
  const code = str(r.code);
  const delivery = r.delivery as DeliveryId;

  const items: OrderLine[] = [];
  if (!Array.isArray(r.items) || r.items.length === 0) {
    errors.items = "Add at least one snack to your order.";
  } else if (r.items.length > MAX_LINES) {
    errors.items = "That's a lot of lines. Please send fewer items at once.";
  } else {
    for (const it of r.items as Record<string, unknown>[]) {
      const productId = str(it?.productId);
      const sizeId = str(it?.sizeId);
      const qty = Number(it?.qty);
      // The product must actually be sold in that size.
      const known = linePrice({ productId, sizeId, qty: 1 }) !== null;
      if (!known || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        errors.items = "Something is wrong with your items. Please refresh and try again.";
        break;
      }
      items.push({ productId, sizeId, qty });
    }
  }

  if (name.length < 2) errors.name = "Enter your name.";
  else if (name.length > 80) errors.name = "That name is too long.";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    errors.phone = "Enter a phone number we can reach, like 0803 123 4567.";
  }

  if (!DELIVERY_OPTIONS.some((d) => d.id === delivery)) {
    errors.items = errors.items ?? "Choose how you'd like to receive your order.";
  }
  if (delivery === "delivery" && address.length < 6) {
    errors.address = "Enter your delivery address: house number, street and area.";
  }
  if (address.length > 300) errors.address = "That address is too long.";
  if (notes.length > 500) errors.notes = "Please keep notes under 500 characters.";
  if (!/^UM-[A-Z0-9]{4}$/.test(code)) {
    errors.items = errors.items ?? "Something went wrong. Please refresh and try again.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    order: { code, items, name, phone, delivery, address, notes },
  };
}
