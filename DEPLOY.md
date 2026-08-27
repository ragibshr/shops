# 🚀 Deployment Guide — Vercel + Supabase

Step-by-step guide to deploy the two-shop platform (OddBox BD + Mithe Bangla)
to **Vercel** with a **Supabase** backend, including AI image generation prompts
for the Mithe Bangla mall storefront.

---

## Live Project Status

| Service | Status | Details |
|---------|--------|---------|
| **GitHub** | ✅ Live | [github.com/ragibshr/shops](https://github.com/ragibshr/shops) |
| **Supabase** | ✅ Live | Project `shops-platform` (bqmbpdwocdnovnegoifo) — Singapore region |
| **Database** | ✅ Migrated | 2 tenants, 8 categories, 16 products seeded |
| **Vercel** | ⚠️ Partial | Project `shops-platform` created, env vars set, deploy pending Windows symlink fix |
| **Custom Domains** | ⏳ Pending | Need DNS configuration |

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Setup](#2-supabase-setup)
3. [Vercel Deployment](#3-vercel-deployment)
4. [Custom Domains](#4-custom-domains)
5. [Going Live Checklist](#5-going-live-checklist)
6. [AI Image Generation Guide](#6-ai-image-generation-guide)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

- **GitHub account** with the repo pushed (`github.com/ragibshr/shops`)
- **Vercel account** (free tier works — [vercel.com](https://vercel.com))
- **Supabase account** (free tier works — [supabase.com](https://supabase.com))
- **Domain names** registered (e.g. on Namecheap, Cloudflare Registrar, etc.)
  - `oddboxbd.shop`
  - `mithebangla.shop`
- **Node.js 18+** installed locally (for any local testing)

---

## 2. Supabase Setup

### 2.1 Create a Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a project name (e.g. `shops-platform`)
3. Set a strong database password (save it somewhere safe)
4. Pick a region closest to your users (e.g. **Southeast Asia — Singapore** or **US East — Virginia**)
5. Click **Create new project** (takes ~2 minutes)

### 2.2 Get API Keys

Once the project is ready, go to **Project Settings → API** (or **Configuration → API**):

> **Live project:** `shops-platform` (ref: `bqmbpdwocdnovnegoifo`)
> Dashboard: [supabase.com/dashboard/project/bqmbpdwocdnovnegoifo](https://supabase.com/dashboard/project/bqmbpdwocdnovnegoifo)

| Key | Where to find it | Used for |
|-----|-------------------|----------|
| `Project URL` | Settings → API → Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon public` key | Settings → API → Project API keys | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | Settings → API → Project API keys (⚠️ keep secret) | `SUPABASE_SERVICE_ROLE_KEY` |

Copy all three — you'll need them in Step 3.

### 2.3 Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/migrations/0001_init.sql` from this repo
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

This creates:
- Tables: `tenants`, `profiles`, `categories`, `products`, `orders`, `order_items`, `tenant_settings`
- Row Level Security policies
- Database functions (`place_order`, `track_order`, etc.)
- Seed data: 4 categories + 8 products for each shop (demo data in Bengali)
- A public storage bucket `product-images` for photo uploads

**Verify:** Go to **Table Editor** — you should see all tables with data.

### 2.4 Create Your Admin Account

1. Go to **Authentication → Users → Add user**
2. Enter your email and a password
3. Click **Create user**
4. Go back to **SQL Editor** and run:

```sql
update public.profiles p
set role = 'owner'
from auth.users u
where p.id = u.id and u.email = 'YOUR_EMAIL@example.com';
```

Replace `YOUR_EMAIL@example.com` with the email you just used.

**Verify:** Go to `/admin/login` on your deployed site → log in with those credentials → you should see the admin dashboard.

> ⚠️ **TODO:** Admin user not yet created. Do this step after deployment is live.

### 2.5 (Optional) Storage Bucket

The migration already creates a public `product-images` bucket. If you want to
upload product photos via the admin panel:

1. Go to **Storage** in Supabase dashboard
2. Verify `product-images` bucket exists and is **Public**
3. Go to **Storage → Policies** and confirm the policy allows authenticated uploads

### 2.6 Supabase Project Settings Summary

| Setting | Value |
|---------|-------|
| Project name | `shops-platform` (or your choice) |
| Region | Singapore / US East (nearest to BD) |
| Database password | (saved in Step 2.1) |
| Free tier limits | 500 MB database, 1 GB storage, 50k monthly active users — more than enough |

---

## 3. Vercel Deployment

### 3.1 Import the Repo

1. Go to [vercel.com](https://vercel.com) → **Add New... → Project**
2. Under **Import Git Repository**, find and select `ragibshr/shops`
3. Click **Import**

> **Live project:** `shops-platform` (oddboxs-projects/shops-platform)
> Dashboard: [vercel.com/teams/oddboxs-projects](https://vercel.com/teams/oddboxs-projects)

### 3.2 Configure the Project

Vercel auto-detects Next.js. Configure as follows:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js (auto-detected) |
| Build Command | `next build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |
| Node.js Version | 20.x (recommended) |

### 3.3 Add Environment Variables

In the Vercel project creation screen, expand **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIs...
```

⚠️ **Important:** Set the `SUPABASE_SERVICE_ROLE_KEY` scope to **Production,
Preview, and Development** — it's needed in all environments.

### 3.4 Deploy

Click **Deploy**. The first build takes ~60 seconds.

After deployment, Vercel gives you a URL like `shops-xyz.vercel.app`.

**Verify:** Open `https://shops-xyz.vercel.app` — you should see the OddBox BD
storefront (default tenant on unknown hosts).

### 3.5 Vercel CLI Deploy (Alternative)

If you prefer CLI deployment instead of GitHub integration:

```bash
vercel login
vercel link --project shops-platform
vercel pull --yes --environment production
vercel --prod --yes
```

**Known Windows issue:** The Vercel CLI may fail with `EPERM: symlink` or
`fetch failed` on Windows without Developer Mode enabled. Solutions:
- Enable **Windows Developer Mode** (Settings → Update & Security → For developers → Developer Mode)
- Or use the GitHub integration approach above (recommended)

### 3.6 Test Both Themes on Vercel

Before connecting custom domains, verify both themes work:

| URL | Expected |
|-----|----------|
| `https://your-project.vercel.app/` | OddBox BD (default) |
| `https://your-project.vercel.app/?shop=mithai` | Mithe Bangla mall experience |
| `https://your-project.vercel.app/shop` | Shared shop page |
| `https://your-project.vercel.app/admin/login` | Admin login |

---

## 4. Custom Domains

### 4.1 Add Domains in Vercel

1. In your Vercel project, go to **Settings → Domains**
2. Add each domain one by one:
   - `oddboxbd.shop`
   - `www.oddboxbd.shop`
   - `mithebangla.shop`
   - `www.mithebangla.shop`
3. Vercel shows you the DNS records to configure

### 4.2 Configure DNS

You have two options:

#### Option A: Move nameservers to Vercel (Recommended)

1. In your domain registrar (Namecheap, etc.), find **Nameserver settings**
2. Replace the existing nameservers with Vercel's (shown in the Vercel domain settings):
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ```
3. Wait 5–30 minutes for propagation
4. Vercel auto-provisions SSL certificates

#### Option B: Keep your registrar DNS, add CNAME/A records

For each domain, add:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| `CNAME` | `@` | `cname.vercel-dns.com` | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com` | Auto |

Or for apex domain, use A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| `A` | `@` | `76.76.21.21` | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com` | Auto |

### 4.3 Verify

After DNS propagates (check with [dnschecker.org](https://dnschecker.org)):

| URL | Should show |
|-----|-------------|
| `https://oddboxbd.shop` | OddBox BD storefront 🎁 |
| `https://mithebangla.shop` | Mithe Bangla mall 🍯 |
| `https://oddboxbd.shop/admin/login` | Admin panel |
| `https://mithebangla.shop/?shop=mithai` | (redundant but works) |

### 4.4 SSL

Vercel auto-provisions and renews Let's Encrypt SSL certificates for all
custom domains. No manual setup needed.

---

## 5. Going Live Checklist

### Before launch:

- [ ] Supabase migration run successfully (all tables + seed data present)
- [ ] Admin account created and can log in at `/admin/login`
- [ ] At least one product has a real photo uploaded (via admin → Products → Edit)
- [ ] AI-generated storefront images placed in `public/images/mithai/`
- [ ] Both domains resolve correctly (test with dnschecker.org)
- [ ] HTTPS works on both domains (auto via Vercel)
- [ ] Test the full flow: browse → add to cart → checkout → order appears in admin
- [ ] Test order tracking at `/track` with a real order number
- [ ] Announcement bar text updated in admin → Settings (for both shops)
- [ ] Delivery fees configured in admin → Settings
- [ ] WhatsApp number configured in admin → Settings

### Post-launch:

- [ ] Monitor Vercel analytics for traffic
- [ ] Monitor Supabase database usage (free tier: 500 MB)
- [ ] Set up Vercel alerts for build failures
- [ ] Consider upgrading Supabase if approaching free tier limits

---

## 6. AI Image Generation Guide

The Mithe Bangla mall storefront needs **two illustrated images**:

### 6.1 Exterior Image (`exterior.png`)

This is the first thing customers see — a cozy, illustrated Bengali sweet shop storefront.

#### Specifications

| Property | Value |
|----------|-------|
| Filename | `exterior.png` (or `.webp`) |
| Aspect ratio | **16:9** (landscape) or **9:16** (portrait for mobile-first) |
| Recommended size | **1920×1080** (landscape) or **1080×1920** (portrait) |
| Max file size | 500 KB (optimize for web) |
| Format | PNG or WebP (WebP preferred for smaller size) |
| Style | Flat illustration / cartoon / storybook — NOT photorealistic |

#### Prompt for AI Image Generator

Use this prompt with **Midjourney**, **DALL-E 3**, **Stable Diffusion**, or **Ideogram**:

```
Illustrated storefront of a traditional Bengali sweet shop called "মিষ্টি বাংলা".
Cozy wooden shop front with a tiled roof, warm golden light spilling from inside.
Glass display cases visible through the doorway showing colorful Indian/Bengali
mithai (sweets) — rosogolla, sandesh, mishti doi in clay pots. Hanging sign with
 Bengali text. Potted plants on either side. Warm evening light, inviting atmosphere.
 Cartoon/storybook illustration style, flat colors, clean lines, no text artifacts.
 Mobile-friendly composition with the door centered in the lower half.
--ar 9:16 --style raw --stylize 400
```

**Alternate prompt (more minimal):**

```
A charming illustrated Bengali sweet shop exterior at golden hour. Wooden doorframe,
clay tile awning, warm interior glow visible through open door. Display shelf with
colorful mithai sweets. Green plants flanking the entrance. Flat illustration style,
warm color palette (amber, cream, forest green), storybook aesthetic, clean vector-like
lines. No people. Door positioned in center-bottom area of the composition.
--ar 9:16
```

#### Door Hotspot Notes

The door in the illustration should be roughly in this area:
```
doorHotspot: { left: "42%", top: "55%", width: "16%", height: "35%" }
```

This means the clickable door area is centered slightly left of center, in the
lower half of the image. When generating, position the door in the lower-center
of the frame.

---

### 6.2 Interior Image (`interior.png`)

The inside of the shop — showing category "racks" that customers can click.

#### Specifications

| Property | Value |
|----------|-------|
| Filename | `interior.png` (or `.webp`) |
| Aspect ratio | **16:9** (landscape) or **9:16** (portrait) |
| Recommended size | **1920×1080** (landscape) or **1080×1920** (portrait) |
| Max file size | 500 KB |
| Format | PNG or WebP |
| Style | Same illustration style as exterior (consistency matters!) |

#### Prompt for AI Image Generator

```
Illustrated interior of a Bengali sweet shop. Four visible display sections/racks
from left to right: (1) colorful mithai sweets — rosogolla, sandesh, barfi,
(2) dairy products — clay pots of doi, butter, ghee bottles, (3) jars of golden
honey with honeycomb, (4) fresh mangoes and seasonal fruits. Wooden shelves,
warm amber lighting, tiled floor. Cozy organized shop interior. Flat illustration
style, warm tones (amber, cream, green accents), storybook/cartoon aesthetic,
clean lines. No people. Each section clearly separated visually.
--ar 9:16 --style raw --stylize 400
```

**Alternate prompt:**

```
Interior view of a traditional Bengali mishti (sweet) shop. Four wooden display
racks arranged in a row: mithai/sweets on the left, dairy products (doi, ghee,
butter) second, honey jars third, mangoes/fruits on the right. Warm golden
interior lighting. Checkerboard tile floor. Shelves with glass jars. Inviting
and organized. Flat vector illustration style, storybook colors, clean edges,
no photorealism. Each rack section roughly equal width.
--ar 9:16
```

#### Rack Hotspot Positions

The four racks are positioned across the interior image:

```ts
racks: [
  { id: "sweets",   area: { left: "5%",  top: "20%", width: "22%", height: "45%" } },
  { id: "dairy",    area: { left: "28%", top: "20%", width: "22%", height: "45%" } },
  { id: "honey",    area: { left: "52%", top: "20%", width: "22%", height: "45%" } },
  { id: "fruits",   area: { left: "76%", top: "20%", width: "22%", height: "45%" } },
]
```

When generating the interior image, arrange the four sections roughly in these
positions: left 5-27%, center-left 28-50%, center-right 52-74%, right 75-97%.

---

### 6.3 Style Consistency Tips

To make exterior and interior look like the same shop:

1. **Use the same model/prompt seed** — if your AI tool supports seeds, use the
   same one for both images
2. **Copy the style keywords** — keep "flat illustration, storybook, warm amber
   tones, clean lines" consistent
3. **Color palette** — stick to: warm amber `#d97706`, forest green `#16a34a`,
   cream `#fef3c7`, brown `#92400e`
4. **Generate extras** — generate 4-6 variations of each, pick the best pair that
   look cohesive together

### 6.4 Post-Processing

After generating:

1. **Resize** to 1080×1920 (portrait) or 1920×1080 (landscape) using
   [squoosh.app](https://squoosh.app) or [tinyPNG](https://tinypng.com)
2. **Optimize** — target < 300 KB per image. Use WebP format if possible.
3. **Check hotspot alignment** — open the image in any editor, overlay the
   percentage grid from the hotspot config, verify the door/racks align
4. **Adjust hotspots if needed** — edit `src/lib/tenants.ts` → `mithai.mall`
   to reposition if the generated art doesn't match the default coordinates

### 6.5 Quick Reference — All Prompts

**Exterior (portrait/mobile-first):**
```
Illustrated storefront of a traditional Bengali sweet shop. Cozy wooden shop front
with tiled roof, warm golden light from inside. Glass display with colorful mithai.
Hanging sign. Potted plants. Warm evening light. Cartoon/storybook illustration,
flat colors, clean lines. Door centered in lower half. --ar 9:16
```

**Interior (portrait/mobile-first):**
```
Interior of Bengali sweet shop. Four display sections: mithai sweets, dairy products
(doi, ghee), honey jars, fresh mangoes. Wooden shelves, warm amber lighting, tiled
floor. Flat illustration style, warm tones, storybook aesthetic, clean lines.
Four equal-width rack sections. --ar 9:16
```

---

## 7. Troubleshooting

### Build fails on Vercel

- Check that all three env vars are set in Vercel → Settings → Environment Variables
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set for all environments (Production, Preview, Development)
- Check the build logs for the specific error

### Pages show "demo mode" banner

- Env vars are missing or incorrect
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://` and ends with `.supabase.co`
- Redeploy after fixing env vars (Vercel → Deployments → → ··· → Redeploy)

### Custom domain shows "Not Found"

- DNS hasn't propagated yet — wait 5-30 minutes
- Check DNS records at [dnschecker.org](https://dnschecker.org)
- Make sure the domain is added in Vercel → Settings → Domains
- If using CNAME, ensure it points to `cname.vercel-dns.com`

### Admin login fails

- Ensure you created the user in Supabase → Authentication → Users
- Ensure you ran the SQL to set `role = 'owner'` for that user
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set (needed for admin actions)

### Mall images not showing

- Images must be in `public/images/mithai/exterior.png` and `interior.png`
- After adding images, redeploy (Vercel doesn't hot-reload `public/` changes)
- The fallback "শীঘ্রই আসছে" placeholder shows when images are missing — this is expected

### Hotspot positions are wrong

- Edit `src/lib/tenants.ts` → `mithai.mall.doorHotspot` or `mithai.mall.racks[].area`
- Coordinates are percentage-based: `{ left: "42%", top: "55%", width: "16%", height: "35%" }`
- Push changes → Vercel auto-deploys

### Carousel not swipeable on mobile

- Ensure the product has multiple images in the `images` array
- Single-image products correctly hide the carousel dots and disable swipe
- Test on a real mobile device (not just browser devtools)

---

## Cost Summary

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Vercel** | 100 GB bandwidth, unlimited deploys | $20/mo Pro plan |
| **Supabase** | 500 MB DB, 1 GB storage, 50k users | $25/mo Pro plan |
| **Domains** | — | ~$10-15/year per domain |
| **AI Image Gen** | Varies by tool | $10-20/month for generations |

**Total for launch: $0/month** (free tiers cover everything for a new shop).
