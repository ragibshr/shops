# 🏪 Two-Shop Platform — OddBox BD + Mithe Bangla

One Next.js codebase serving **two storefronts** based on the visitor's domain:

| Domain | Shop | Vibe |
|---|---|---|
| [oddboxbd.shop](https://oddboxbd.shop) | 🎁 অডবক্স বিডি — funny gag gifts | Loud, comic, meme energy |
| [mithebangla.shop](https://mithebangla.shop) | 🍯 মিষ্টি বাংলা — sweets, dairy, honey, mango | Fresh green & appetizing |

Both are fully in **Bengali**, mobile-first, with a shared engine:
no-registration ordering (cart → one form → COD), order tracking by phone,
and a multi-role admin panel at `/admin`.

---

## 🧱 Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Supabase** — Postgres, Auth (admins only), Storage (product photos), RLS
- Framer Motion, Zustand (cart), react-hook-form + zod
- Deploy target: **Cloudflare Pages** (one deployment → both domains)

## 🚀 Local development

```bash
npm install
npm run dev          # http://localhost:3000 (defaults to oddbox theme)
```

Without env vars the app runs in **demo mode**: local placeholder catalog,
simulated checkout — perfect for UI work.

## 🔌 Connecting Supabase (go-live step 1)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Copy `.env.example` → `.env.local`, fill in from *Project Settings → API*:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, powers owner actions)
3. Open **SQL Editor** in Supabase and run the whole of
   `supabase/migrations/0001_init.sql` (schema + RLS + RPCs + Bengali seed data).
4. Restart `npm run dev` — the demo banner disappears and live data flows.
5. In Supabase → **Authentication → Users → Add user**, create your own account,
   then run this once to make yourself owner (replace the email):
   ```sql
   update public.profiles p
   set role = 'owner'
   from auth.users u
   where p.id = u.id and u.email = 'you@example.com';
   ```
6. Log in at `/admin/login` 🎉

### Admin roles
- **Owner 👑** — everything: both shops' products/orders/settings, team management
- **Moderator 🛡️** — only assigned shops; orders + products; no team/settings

## ☁️ Deploying to Cloudflare Pages (go-live step 2)

1. Push this repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**
   → pick this repo.
3. Build settings: framework preset **Next.js**, build command
   `npx @cloudflare/next-on-pages@1`, output dir `.vercel/output/static`.
4. Add all three env vars from `.env.local` in *Settings → Variables*.
5. After first deploy: *Custom domains* → add `oddboxbd.shop`,
   `www.oddboxbd.shop`, `mithebangla.shop`, `www.mithebangla.shop`.

### DNS (Namecheap)
Move nameservers to Cloudflare (free plan) per CF's instructions, then CF
auto-provisions the apex + www records for the Pages project. Alternatively keep
Namecheap DNS and CNAME both hosts to `<project>.pages.dev`.

> The domain→theme mapping lives in `src/proxy.ts`. Update it if you rename domains.

## 🗂️ Key files

```
src/proxy.ts                  host → tenant header (the heart of multi-tenancy)
src/lib/tenants.ts            per-shop branding, copy, fonts, colors
src/lib/data.ts               product/category queries (+ demo fallback)
src/app/(store)/…             customer-facing pages (shared by both domains)
src/app/admin/…               login, dashboard, orders, products, team, settings
supabase/migrations/0001_init.sql   full DB schema + security + seed
```

## 🧪 Order flow (customer view)

Browse → cart drawer → `/checkout` single form → order number like `OB-260825-1234`
→ confetti 🎉 → WhatsApp confirm button → track anytime at `/track` using phone +
order number.

COD only · zone fees editable in admin settings · free delivery threshold supported.
