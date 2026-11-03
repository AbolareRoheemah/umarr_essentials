"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type Slide = { src: string; alt: string; title: string; note: string };

const REDUCED = "(prefers-reduced-motion: reduce)";
const INTERVAL_MS = 5000;

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  // Server and first paint assume reduced motion (no autoplay), then the
  // real preference takes over.
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );

  const playing = !reduced && !userPaused;
  const running = playing && !hovering && !focusWithin;

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const n = (i + slides.length) % slides.length;
      el.scrollTo({ left: n * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [slides.length, reduced],
  );

  const current = () => {
    const el = track.current;
    return el ? Math.round(el.scrollLeft / el.clientWidth) : 0;
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const el = track.current;
      if (!el) return;
      goTo(Math.round(el.scrollLeft / el.clientWidth) + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [running, goTo]);

  const btn =
    "grid size-11 place-items-center rounded-full border border-line bg-paper text-navy transition-colors hover:bg-gold-wash";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Our snacks"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
    >
      {/* The gold outline sits behind the photo, offset down and to the right */}
      <div className="relative mb-3 mr-3">
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-gold"
        />
        <div
          ref={track}
          tabIndex={0}
          aria-label="Product photos"
          aria-live={running ? "off" : "polite"}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="relative flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-lg bg-navy [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, i) => (
            <div
              key={s.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className="relative size-full shrink-0 snap-center"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(min-width: 1024px) 540px, 90vw"
                priority={i === 0}
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent px-5 pb-5 pt-20 text-cream">
                <p className="font-serif text-3xl font-semibold leading-none sm:text-4xl">
                  {s.title}
                </p>
                <p className="mt-1.5 text-sm">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className="grid h-11 w-8 place-items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-navy" : "w-1.5 bg-gold"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!reduced && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-pressed={userPaused}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className={btn}
            >
              {userPaused ? (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.5v11l9-5.5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => goTo(current() - 1)}
            aria-label="Previous photo"
            className={btn}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(current() + 1)}
            aria-label="Next photo"
            className={btn}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m6 2 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
