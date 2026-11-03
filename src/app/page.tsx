import Image from "next/image";
import HeroCarousel, { type Slide } from "@/components/HeroCarousel";
import OrderApp from "@/components/OrderApp";
import { BUSINESS, PRODUCTS, lowestPrice } from "@/lib/menu";
import { formatNaira, whatsappUrl } from "@/lib/order";

const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;
const from = (id: string) => `From ${formatNaira(lowestPrice(product(id)))}`;

const SLIDES: Slide[] = [
  {
    src: "/photos/plantain-chips.webp",
    alt: "Golden plantain chips in a gold UMARR pouch and a red-lid jar",
    title: "Plantain chips",
    note: from("plantain-chips"),
  },
  {
    src: "/photos/chin-chin-jars.webp",
    alt: "Chin chin in a 1.5 litre jar and a 1 litre jar, both with red lids",
    title: "Chin chin",
    note: from("chin-chin"),
  },
  {
    src: "/photos/chin-chin-range.webp",
    alt: "Chin chin in two gold pouches and two jars of different sizes",
    title: "Every size you need",
    note: "Pouches for a treat, jars for sharing",
  },
  {
    src: "/photos/plantain-ranges.jpg",
    alt: "Plantain chips in two gold pouches",
    title: "Plantain chips in pouches",
    note: "Pouches for a treat",
  },
  {
    src: "/photos/coconut1.jpg",
    alt: "Sweetened coconut flakes in gold pouches",
    title: "Sweetened coconut flakes",
    note: "Use for yoghurt, smoothies, baking, or just as a snack",
  },
  {
    src: "/photos/coconut2.jpg",
    alt: "Unsweetened coconut flakes in gold pouches",
    title: "Unsweetened coconut flakes",
    note: "Use for yoghurt, smoothies, baking, or just as a snack",
  },
];

const CHEAPEST = Math.min(...PRODUCTS.map(lowestPrice));

const STEPS = [
  {
    title: "Pick your snacks",
    body: "Choose what you want and the pack size, then fill in your details.",
  },
  {
    title: "Send your order",
    body: "Check the summary of what you picked and the price, then send it to us",
  },
  {
    title: "We confirm on WhatsApp",
    body: "We tell you what&apos;s ready now, what needs a little time, and when you&apos;ll get it.",
  },
  {
    title: "Pay by bank transfer",
    body: "We share our account details. Send us your payment receipt on WhatsApp.",
  },
  {
    title: "Get your snacks",
    body: "We book a rider, your own rider collects, or you pick up.",
  },
];

const FAQ = [
  {
    q: "Is everything really available?",
    a: "The menu shows every snack because we make to order. When you send your order we confirm what's ready now and give you a date for anything that needs time.",
  },
  {
    q: "When do I pay?",
    a: "After we confirm your order. We start making what you've ordered once your payment is confirmed.",
  },
  {
    q: "How do I pay?",
    a: "By bank transfer. We send the account details on WhatsApp. Please send your receipt there when you've paid.",
  },
  {
    q: "Who pays the delivery fee?",
    a: "You do, directly to the rider. The fee depends on the distance, and we'll tell you the rider's price before booking.",
  },
  {
    q: "Can I send my own rider?",
    a: "Yes. Choose \"I'll send my own rider\" and add their name or number in the notes.",
  },
  {
    q: "Can I pick up?",
    a: `Yes. We're near ${BUSINESS.pickupArea}. Once your order is confirmed we send you the full address.`,
  },
];

export default function Home() {
  const chatUrl = whatsappUrl(
    BUSINESS.whatsappNumber,
    "Hello UMARR Essentials, I have a question.",
  );

  return (
    <main>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <a href="#top" aria-label="UMARR Essentials, back to top">
            <Image
              src="/umarr-logo.png"
              alt="UMARR Essentials"
              width={1200}
              height={238}
              priority
              className="h-auto w-32 sm:w-36"
            />
          </a>
          <nav aria-label="Main" className="flex items-center gap-5 text-sm font-medium">
            <a href="#menu" className="hidden hover:text-gold-deep sm:inline">
              Menu
            </a>
            <a href="#how" className="hidden hover:text-gold-deep sm:inline">
              How it works
            </a>
            <a href="#faq" className="hidden hover:text-gold-deep sm:inline">
              Questions
            </a>
            <a
              href="#menu"
              className="rounded-md bg-navy px-4 py-2.5 font-semibold text-cream transition-colors hover:bg-navy-soft"
            >
              Order now
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="mx-auto grid w-full max-w-6xl gap-y-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_32rem] lg:gap-x-16 lg:gap-y-0 lg:pt-16"
      >
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl">
            Crunchy snacks, made fresh for your order
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink-soft sm:mt-6 sm:text-lg">
            Chin chin, plantain chips, coconut flakes and coconut candy, packed
            in gold pouches and jars. Choose what you like, send your order on
            WhatsApp, and we&apos;ll confirm it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#menu"
              className="rounded-md bg-navy px-8 py-4 font-semibold text-cream transition-colors hover:bg-navy-soft"
            >
              Choose your snacks
            </a>
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-8"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <HeroCarousel slides={SLIDES} />
        </div>

        <dl className="grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6 lg:col-start-1 lg:row-start-2 lg:mt-12 lg:self-start">
          <div>
            <dt className="text-xl font-semibold text-navy sm:text-2xl">
              {formatNaira(CHEAPEST)}
            </dt>
            <dd className="mt-1 text-sm text-ink-soft">Mini pouches start at</dd>
          </div>
          <div>
            <dt className="text-xl font-semibold text-navy sm:text-2xl">Fresh</dt>
            <dd className="mt-1 text-sm text-ink-soft">Made to order</dd>
          </div>
          <div>
            <dt className="text-xl font-semibold text-navy sm:text-2xl">Lagos</dt>
            <dd className="mt-1 text-sm text-ink-soft">Delivery or Igando pickup</dd>
          </div>
        </dl>

      </section>

      <OrderApp />

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-3xl px-5 py-16">
        <h2 className="text-4xl sm:text-5xl">How it works</h2>
        <ol className="mt-8 grid gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-3">
              <span className="font-sans text-3xl font-light leading-none text-gold-deep">{i + 1}</span>
              <div>
                <h3 className="text-2xl">{s.title}</h3>
                <p className="mt-1 text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-3xl px-5 pb-16">
        <h2 className="text-4xl sm:text-5xl">Questions</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="text-xl text-gold-deep transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-xl text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line pb-8 pt-8 text-center">
          <div className="mx-auto flex w-full max-w-6xl justify-between items-center gap-4 px-5">
            <div>
              <Image
                src="/umarr-logo.png"
                alt="UMARR Essentials"
                width={1200}
                height={238}
                className="mx-auto h-auto w-44"
              />
              {/* <div className="rule mx-auto mt-6 w-48" aria-hidden="true">
                <span />
              </div> */}
            </div>
            <div>
              <p className="mt-6">
                <a
                  href={chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold tracking-wide text-navy underline underline-offset-4"
                >
                  WhatsApp {BUSINESS.whatsappDisplay}
                </a>
              </p>
              <p className="mt-1 text-ink-soft">{BUSINESS.pickupArea}</p>
            </div>
            <p className="mt-6 font-serif text-xl italic text-ink-soft">
              Thanks for your patronage!
            </p>
          </div>
        </footer>
    </main>
  );
}
