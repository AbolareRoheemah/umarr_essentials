"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BUSINESS,
  DELIVERY_OPTIONS,
  PACK_SIZES,
  PRODUCTS,
  type DeliveryId,
  type SizeKind,
} from "@/lib/menu";
import OrderConfirmation from "./OrderConfirmation";
import {
  estimateTotal,
  formatNaira,
  generateOrderCode,
  lineLabel,
  type FieldErrors,
  type Order,
  type OrderLine,
  validateOrder,
} from "@/lib/order";

const key = (productId: string, sizeId: string) => `${productId}|${sizeId}`;

const KIND_LABEL: Record<SizeKind, string> = { pouch: "Pouches", jar: "Jars" };

type Done = { order: Order; notified: boolean };

export default function OrderApp() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<DeliveryId>("delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, stays empty for people
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const items: OrderLine[] = useMemo(() => {
    const out: OrderLine[] = [];
    for (const p of PRODUCTS) {
      for (const s of p.sizes) {
        const q = qty[key(p.id, s.sizeId)] ?? 0;
        if (q > 0) out.push({ productId: p.id, sizeId: s.sizeId, qty: q });
      }
    }
    return out;
  }, [qty]);

  const count = items.reduce((n, l) => n + l.qty, 0);
  const total = estimateTotal(items);

  function change(productId: string, sizeId: string, delta: number) {
    setQty((prev) => {
      const k = key(productId, sizeId);
      const next = Math.min(50, Math.max(0, (prev[k] ?? 0) + delta));
      const copy = { ...prev };
      if (next === 0) delete copy[k];
      else copy[k] = next;
      return copy;
    });
    if (errors.items) setErrors((e) => ({ ...e, items: undefined }));
  }

  function remove(line: OrderLine) {
    setQty((prev) => {
      const copy = { ...prev };
      delete copy[key(line.productId, line.sizeId)];
      return copy;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    const payload = {
      code: generateOrderCode(),
      items,
      name,
      phone,
      delivery,
      address,
      notes,
    };
    const result = validateOrder(payload);
    if (!result.ok) {
      setErrors(result.errors);
      const first = (["name", "phone", "address"] as const).find(
        (f) => result.errors[f],
      );
      if (first) document.getElementById(`field-${first}`)?.focus();
      else if (result.errors.items)
        document.getElementById("order-summary")?.scrollIntoView({ block: "center" });
      return;
    }

    setErrors({});
    setSending(true);
    let notified = false;
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.order, website }),
        signal: AbortSignal.timeout(7000),
      });
      const data = await res.json();
      notified = res.ok && data?.notified === true;
    } catch {
      notified = false; // the WhatsApp message still carries the order
    }
    setSending(false);
    setDone({ order: result.order, notified });
    requestAnimationFrame(() =>
      document.getElementById("order")?.scrollIntoView({ block: "start" }),
    );
  }

  function startOver() {
    setDone(null);
    setQty({});
    setNotes("");
    document.getElementById("menu")?.scrollIntoView({ block: "start" });
  }

  const inputBase =
    "w-full rounded-md border bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 border-line";

  return (
    <>
      {/* ── Menu ─────────────────────────────────────────── */}
      <section id="menu" className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 className="text-4xl sm:text-5xl">The menu</h2>
        <p className="mt-3 max-w-xl text-ink-soft">
          Every snack is made to order. Choose what you&apos;d like, and we&apos;ll
          confirm what&apos;s ready now and when the rest will be.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="rounded-md border border-line bg-paper p-5 sm:p-6"
            >
              <div className="flex items-center gap-4">
                {p.photo ? (
                  <Image
                    src={p.photo.src}
                    alt={p.photo.alt}
                    width={200}
                    height={200}
                    sizes="96px"
                    className="size-24 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="grid size-24 shrink-0 place-items-center rounded-md bg-gold-wash"
                  >
                    <span className="size-4 rotate-45 bg-gold" />
                  </div>
                )}
                <div>
                  <h3 className="text-3xl">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
                </div>
              </div>

              {(["pouch", "jar"] as SizeKind[]).map((kind) => {
                const rows = p.sizes.filter(
                  (z) => PACK_SIZES.find((s) => s.id === z.sizeId)?.kind === kind,
                );
                if (rows.length === 0) return null;
                return (
                  <div key={kind} className="mt-5">
                    <p className="text-sm font-semibold text-ink-soft">
                      {KIND_LABEL[kind]}
                    </p>
                    <ul className="mt-1 divide-y divide-line">
                      {rows.map((z) => {
                        const size = PACK_SIZES.find((s) => s.id === z.sizeId)!;
                        const q = qty[key(p.id, z.sizeId)] ?? 0;
                        return (
                          <li
                            key={z.sizeId}
                            className="flex items-center justify-between gap-3 py-2"
                          >
                            <div>
                              <span className="font-medium text-ink">
                                {size.name}
                              </span>
                              {z.detail && (
                                <span className="ml-1.5 text-sm text-ink-soft">
                                  ({z.detail})
                                </span>
                              )}
                              <span className="block text-sm font-semibold text-gold-deep">
                                {formatNaira(z.price)}
                              </span>
                            </div>
                            <div
                              className="flex items-center"
                              role="group"
                              aria-label={`${p.name}, ${size.name} quantity`}
                            >
                              <button
                                type="button"
                                onClick={() => change(p.id, z.sizeId, -1)}
                                disabled={q === 0}
                                aria-label={`Remove one ${p.name} ${size.name}`}
                                className="grid size-11 place-items-center rounded-full border border-line text-xl text-navy transition-colors hover:bg-gold-wash disabled:opacity-30"
                              >
                                −
                              </button>
                              <span
                                className="w-8 text-center font-semibold tabular-nums"
                                aria-live="polite"
                              >
                                {q}
                              </span>
                              <button
                                type="button"
                                onClick={() => change(p.id, z.sizeId, 1)}
                                aria-label={`Add one ${p.name} ${size.name}`}
                                className="grid size-11 place-items-center rounded-full bg-navy text-xl text-cream transition-colors hover:bg-navy-soft"
                              >
                                +
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </article>
          ))}
        </div>
      </section>

      {/* ── Order ────────────────────────────────────────── */}
      <section id="order" className="bg-gold-wash/50 py-16">
        <div className="mx-auto w-full max-w-2xl px-5">
          {done ? (
            <OrderConfirmation
              order={done.order}
              notified={done.notified}
              onStartOver={startOver}
            />
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="text-4xl sm:text-5xl">Your order</h2>

              <div id="order-summary" className="mt-6 rounded-md border border-line bg-paper p-5">
                {items.length === 0 ? (
                  <p className={errors.items ? "text-danger" : "text-ink-soft"} role={errors.items ? "alert" : undefined}>
                    {errors.items ?? "Nothing here yet. Add snacks from the menu above."}
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-line">
                      {items.map((l) => (
                        <li
                          key={key(l.productId, l.sizeId)}
                          className="flex items-center justify-between gap-3 py-2"
                        >
                          <span>
                            <span className="font-semibold tabular-nums">{l.qty} ×</span>{" "}
                            {lineLabel(l)}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(l)}
                            className="min-h-11 px-2 text-sm text-gold-deep underline underline-offset-4"
                            aria-label={`Remove ${lineLabel(l)} from order`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    {total !== null && (
                      <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3">
                        <span className="text-sm text-ink-soft">
                          Items total. Delivery is paid to the rider.
                        </span>
                        <span className="text-xl font-semibold text-navy">
                          {formatNaira(total)}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="mt-8 grid gap-5">
                <div>
                  <label htmlFor="field-name" className="mb-1 block text-sm font-semibold">
                    Your name
                  </label>
                  <input
                    id="field-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    className={`${inputBase} ${errors.name ? "border-danger" : ""}`}
                  />
                  {errors.name && (
                    <p id="err-name" className="mt-1 text-sm text-danger">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="field-phone" className="mb-1 block text-sm font-semibold">
                    Phone number
                  </label>
                  <input
                    id="field-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    className={`${inputBase} ${errors.phone ? "border-danger" : ""}`}
                  />
                  {errors.phone && (
                    <p id="err-phone" className="mt-1 text-sm text-danger">{errors.phone}</p>
                  )}
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">How would you like to get it?</legend>
                  <div className="grid gap-3">
                    {DELIVERY_OPTIONS.map((d) => (
                      <label
                        key={d.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-paper p-4 has-[:checked]:border-navy has-[:checked]:bg-gold-wash/60 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep"
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={d.id}
                          checked={delivery === d.id}
                          onChange={() => setDelivery(d.id)}
                          className="mt-1 size-4 accent-navy"
                        />
                        <span>
                          <span className="block font-semibold">{d.label}</span>
                          <span className="block text-sm text-ink-soft">
                            {d.id === "pickup" ? `Pickup near ${BUSINESS.pickupArea}. We share the full address once your order is confirmed.` : d.hint}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {delivery === "delivery" && (
                  <div>
                    <label htmlFor="field-address" className="mb-1 block text-sm font-semibold">
                      Delivery address
                    </label>
                    <textarea
                      id="field-address"
                      name="address"
                      rows={3}
                      autoComplete="street-address"
                      placeholder="House number, street, area"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? "err-address" : undefined}
                      className={`${inputBase} ${errors.address ? "border-danger" : ""}`}
                    />
                    {errors.address && (
                      <p id="err-address" className="mt-1 text-sm text-danger">{errors.address}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="field-notes" className="mb-1 block text-sm font-semibold">
                    Notes <span className="font-normal text-ink-soft">(optional)</span>
                  </label>
                  <textarea
                    id="field-notes"
                    name="notes"
                    rows={2}
                    placeholder={
                      delivery === "own-rider"
                        ? "Your rider&apos;s name or phone number, and when they&apos;ll come"
                        : "A date you need it by, referrer's name or anything we should know"
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${inputBase} ${errors.notes ? "border-danger" : ""}`}
                  />
                  {errors.notes && <p className="mt-1 text-sm text-danger">{errors.notes}</p>}
                </div>

                {/* Honeypot: hidden from people and screen readers */}
                <div aria-hidden="true" className="absolute left-[-9999px]">
                  <label>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-md bg-navy px-7 py-4 text-base font-semibold text-cream transition-colors hover:bg-navy-soft disabled:opacity-60 cursor-pointer"
                >
                  {sending ? "Sending…" : "Send order"}
                </button>
                <p className="-mt-2 text-sm text-ink-soft">
                We&apos;ll confirm your order on WhatsApp. You pay only after we confirm.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Mobile order bar ─────────────────────────────── */}
      {count > 0 && !done && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gold bg-navy text-cream">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
            <p className="text-sm" aria-live="polite">
              {count} {count === 1 ? "item" : "items"}
              {total !== null && ` · ${formatNaira(total)}`}
            </p>
            <a
              href="#order"
              className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-wash"
            >
              Review order
            </a>
          </div>
        </div>
      )}
    </>
  );
}
