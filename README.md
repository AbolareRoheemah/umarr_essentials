# UMARR Essentials: snack order website

A single-page Next.js site. Customers pick snacks and pack sizes, fill in their details,
and the site:

1. sends you a private **Telegram alert** with the order, and
2. opens **WhatsApp** with the order already written so they can send it to you.

You then confirm what's available (and when) on WhatsApp, take payment by bank transfer,
and arrange delivery. There is no database, no admin page and no email.

## Run it on your computer

```bash
npm install
cp .env.example .env.local   # then fill in the two Telegram values below
npm run dev                  # opens at http://localhost:3000
```

## Set up the Telegram alert (about 5 minutes, free)

1. In Telegram, search for **@BotFather** and send `/newbot`. Pick a name and a username
   ending in `bot`. BotFather gives you a **token**. Put it in `TELEGRAM_BOT_TOKEN`.
2. Open your new bot in Telegram and press **Start**, then send it any message ("hi").
3. In a browser, open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   (replace `<YOUR_TOKEN>` with your token). Find `"chat":{"id":123456789` in the
   result. That number is your **chat id**. Put it in `TELEGRAM_CHAT_ID`.
4. Restart `npm run dev`, place a test order, and the alert should arrive.

If Telegram isn't set up, the site still works: the customer's WhatsApp message is
the order. You just won't get the backup alert.

## Update prices, sizes, photos and details

Everything is in **`src/lib/menu.ts`**:

- **Prices and sizes:** each product lists the sizes it is sold in, with a price.
  Only the sizes listed are offered (for example, plantain chips has no jumbo jar).
  To change a price, edit the number. To add a size, add a line such as
  `{ sizeId: "jumbo-jar", price: 6500, detail: "1.5L" }`.
- **Product photos:** put the image in `public/photos/` (square, about 1000 px wide,
  `.webp` or `.jpg`), then add `photo: { src: "/photos/your-file.webp", alt: "what the photo shows" }`
  to the product. Products without a photo show a plain gold tile.
- **Home page carousel:** the slides are listed at the top of `src/app/page.tsx` (`SLIDES`).
- **Product names and descriptions**, plus `BUSINESS` (phone number, pickup area).

The order form, the WhatsApp message and the server check all read from this file,
so a size or price change here updates everything.

## Put it online (Vercel, free)

1. Push this folder to a GitHub repository.
2. On vercel.com, import the repository.
3. Under **Settings → Environment Variables**, add `TELEGRAM_BOT_TOKEN` and
   `TELEGRAM_CHAT_ID`.
4. Deploy. Every time you push a change (like new prices), the site updates.

## Notes

- The order form has a hidden field that catches simple spam bots. If you ever get
  spam orders, tell Claude and we'll add rate limiting.
- Fonts (Cormorant Garamond and Montserrat, both open-source) are bundled in
  `src/app/fonts`, so the site doesn't call Google at runtime.
- The delivery fee is not in the site: customers pay the rider directly, as planned.
