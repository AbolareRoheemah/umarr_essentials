// ─────────────────────────────────────────────────────────────
// Everything you'll want to edit lives in this file:
// business details, products, sizes, prices and photos.
// After editing, redeploy (on Vercel this happens automatically
// when you push the change).
// ─────────────────────────────────────────────────────────────

export const BUSINESS = {
  name: "UMARR Essentials",
  line: "Premium Snacks",
  tagline: "Quality Essentials, Everyday.",
  // WhatsApp number in international format, digits only (no + or spaces).
  whatsappNumber: "2347061127719",
  whatsappDisplay: "0706 112 7719",
  // Shown publicly. The full address is shared only after you confirm an order.
  pickupArea: "Alh. Ede Bus stop, Igando, Lagos",
};

export type SizeKind = "pouch" | "jar";

export type PackSize = {
  id: string;
  name: string;
  kind: SizeKind;
};

export const PACK_SIZES: PackSize[] = [
  { id: "mini-pouch", name: "Mini pouch", kind: "pouch" },
  { id: "midi-pouch", name: "Midi pouch", kind: "pouch" },
  { id: "regular-jar", name: "Regular jar", kind: "jar" },
  { id: "jumbo-jar", name: "Jumbo jar", kind: "jar" },
];

export type ProductSize = {
  sizeId: string;
  // Price in naira.
  price: number;
  // What's in the pack, for example "1L". Shown next to the size name.
  detail?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  // Photo in /public/photos. Leave out until you have one.
  photo?: { src: string; alt: string };
  // Only the sizes listed here are offered for this product.
  sizes: ProductSize[];
};

export const PRODUCTS: Product[] = [
  {
    id: "chin-chin",
    name: "Chin chin",
    description: "Crunchy, golden bites, made fresh for your order.",
    photo: {
      src: "/photos/chin-chin-jars.webp",
      alt: "Chin chin in two UMARR jars with red lids",
    },
    sizes: [
      { sizeId: "mini-pouch", price: 1000 },
      { sizeId: "midi-pouch", price: 2000 },
      { sizeId: "regular-jar", price: 4500, detail: "1L" },
      { sizeId: "jumbo-jar", price: 5500, detail: "1.5L" },
    ],
  },
  {
    id: "plantain-chips",
    name: "Plantain chips",
    description: "Thin, crisp plantain slices with natural sweetness.",
    photo: {
      src: "/photos/plantain-chips.webp",
      alt: "Plantain chips in a gold UMARR pouch and a red-lid jar",
    },
    sizes: [
      { sizeId: "mini-pouch", price: 1200 },
      { sizeId: "midi-pouch", price: 2200 },
      { sizeId: "regular-jar", price: 5500, detail: "500g" },
    ],
  },
  {
    id: "coconut-flakes-sweet",
    name: "Coconut flakes, sweetened",
    description: "Light, crisp coconut flakes with a gentle sweetness.",
    photo: {
      src: "/photos/coconut1.jpg",
      alt: "Sweetened coconut flakes in a gold UMARR pouch and a red-lid jar",
    },
    sizes: [
      { sizeId: "mini-pouch", price: 1500 },
      { sizeId: "midi-pouch", price: 3000 },
      { sizeId: "regular-jar", price: 5500, detail: "1L" },
    ],
  },
  {
    id: "coconut-flakes-salted",
    name: "Coconut flakes, unsweetened",
    description: "Crispy, lightly salted coconut flakes.",
    photo: {
      src: "/photos/coconut2.jpg",
      alt: "Unsweetened coconut flakes in a gold UMARR pouch and a red-lid jar",
    },
    sizes: [
      { sizeId: "mini-pouch", price: 1500 },
      { sizeId: "midi-pouch", price: 3000 },
      { sizeId: "regular-jar", price: 5500, detail: "1L" },
    ],
  },
  {
    id: "coconut-candy",
    name: "Coconut candy",
    description: "Sweet, chewy coconut candy.",
    sizes: [
      { sizeId: "mini-pouch", price: 1500 },
      { sizeId: "midi-pouch", price: 3000 },
      { sizeId: "regular-jar", price: 5500, detail: "1L" },
    ],
  },
];

export function lowestPrice(product: Product): number {
  return Math.min(...product.sizes.map((s) => s.price));
}

export const DELIVERY_OPTIONS = [
  {
    id: "delivery",
    label: "Deliver to me",
    hint: "We book an inDrive or Chowdeck rider. You pay the rider directly.",
  },
  {
    id: "own-rider",
    label: "I'll send my own rider",
    hint: "Your rider collects from us once your order is ready.",
  },
  {
    id: "pickup",
    label: "I'll pick up",
    hint: `Pickup in Igando. We share the full address once your order is confirmed.`,
  },
] as const;

export type DeliveryId = (typeof DELIVERY_OPTIONS)[number]["id"];
