"use client";

import { useEffect, useRef } from "react";
import { BUSINESS } from "@/lib/menu";
import {
  buildWhatsAppText,
  deliveryLabel,
  estimateTotal,
  formatNaira,
  lineLabel,
  linePrice,
  type Order,
  whatsappUrl,
} from "@/lib/order";

type Props = {
  order: Order;
  // true when the order alert reached UMARR; false when it did not, in which
  // case the customer must send the order on WhatsApp for it to count.
  notified: boolean;
  onStartOver: () => void;
};

const NEXT_STEPS = [
  "We message you on WhatsApp to confirm what's ready. You can also message us on WhatsApp using the link below if you don't want to wait.",
  "You pay by bank transfer once we've confirmed, then send us your receipt.",
  "We book your rider, your own rider collects, or you pick up.",
];

export default function OrderConfirmation({ order, notified, onStartOver }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  const total = estimateTotal(order.items);
  const firstName = order.name.split(/\s+/)[0];
  const chatHref = whatsappUrl(BUSINESS.whatsappNumber, buildWhatsAppText(order));

  const deliveryNote =
    order.delivery === "delivery"
      ? "Delivery fee is paid directly to the rider."
      : order.delivery === "own-rider"
        ? "Your rider collects from us, so there's no delivery fee from us."
        : "Pickup, so there's no delivery fee.";

  return (
    <div className="rounded-md border border-line bg-paper p-6 sm:p-8">
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto grid size-14 place-items-center rounded-full border-2 border-gold text-navy"
        >
          <svg width="26" height="26" viewBox="0 0 26 26">
            <path
              d="m5 13.5 5.5 5.5L21 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          ref={heading}
          tabIndex={-1}
          className="mt-4 text-4xl outline-none sm:text-5xl"
        >
          {notified ? `Thank you, ${firstName}` : "One more step"}
        </h2>
        <p className="mt-2 font-semibold tracking-wide text-gold-deep">
          Order {order.code}
        </p>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          {notified ? (
            <>
              We&apos;ve received your order and will confirm it on WhatsApp at{" "}
              <span className="whitespace-nowrap font-semibold text-ink">
                {order.phone}
              </span>
              . You pay only after we confirm.
            </>
          ) : (
            <>
              Your order isn&apos;t with us yet. Tap the button below and press send
              in WhatsApp so we get it. We&apos;ll confirm it there, and you pay only
              after that.
            </>
          )}
        </p>
        {!notified && (
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-md bg-navy px-7 py-4 font-semibold text-cream transition-colors hover:bg-navy-soft"
          >
            Send order on WhatsApp
          </a>
        )}
      </div>

      {/* Breakdown */}
      <h3 className="mt-10 text-2xl">Your order</h3>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {order.items.map((l) => {
          const unit = linePrice(l);
          return (
            <li
              key={`${l.productId}|${l.sizeId}`}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <span>
                <span className="font-semibold tabular-nums">{l.qty} ×</span>{" "}
                {lineLabel(l)}
                {unit !== null && l.qty > 1 && (
                  <span className="block text-sm text-ink-soft">
                    {formatNaira(unit)} each
                  </span>
                )}
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {unit !== null ? formatNaira(unit * l.qty) : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <span className="font-semibold">Items total</span>
        <span className="text-2xl font-semibold tabular-nums text-navy">
          {total !== null ? formatNaira(total) : "Confirmed on WhatsApp"}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{deliveryNote}</p>

      {/* Details */}
      <h3 className="mt-10 text-2xl">Your details</h3>
      <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-ink-soft">Name</dt>
        <dd>{order.name}</dd>
        <dt className="text-ink-soft">Phone</dt>
        <dd>{order.phone}</dd>
        <dt className="text-ink-soft">Delivery</dt>
        <dd>{deliveryLabel(order.delivery)}</dd>
        {order.delivery === "delivery" && order.address && (
          <>
            <dt className="text-ink-soft">Address</dt>
            <dd className="whitespace-pre-line">{order.address}</dd>
          </>
        )}
        {order.notes && (
          <>
            <dt className="text-ink-soft">Notes</dt>
            <dd className="whitespace-pre-line">{order.notes}</dd>
          </>
        )}
      </dl>

      {/* What happens next */}
      <h3 className="mt-10 text-2xl">What happens next</h3>
      <ol className="mt-3 grid gap-3">
        {NEXT_STEPS.map((text, i) => (
          <li key={text} className="grid grid-cols-[1.5rem_1fr] gap-2 text-sm">
            <span className="font-semibold text-gold-deep">{i + 1}</span>
            <span className="text-ink-soft">{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-6">
        {notified ? (
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Message us on WhatsApp
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-11 cursor-pointer text-sm font-medium text-gold-deep underline underline-offset-4"
        >
          Start a new order
        </button>
      </div>
    </div>
  );
}