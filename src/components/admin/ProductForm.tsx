"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { Loader2, Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { saveProductAction } from "@/app/admin/actions"
import type { Category, Product } from "@/lib/types"

export default function ProductForm({
  mode,
  tenant,
  categories,
  product,
}: {
  mode: "new" | "edit"
  tenant: string
  categories: Category[]
  product?: Product
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [titleBn, setTitleBn] = useState(product?.title_bn ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [tagline, setTagline] = useState(product?.tagline_bn ?? "")
  const [description, setDescription] = useState(product?.description_bn ?? "")
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "")
  const [price, setPrice] = useState(String(product?.price_bdt ?? ""))
  const [comparePrice, setComparePrice] = useState(product?.compare_price_bdt?.toString() ?? "")
  const [stock, setStock] = useState(product?.stock === null || product?.stock === undefined ? "" : String(product.stock))
  const [badge, setBadge] = useState(product?.badge_bn ?? "")
  const [variantsText, setVariantsText] = useState(
    (product?.variants ?? []).map((v) => `${v.label}|${v.priceDelta}`).join("\n"),
  )
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [seasonFrom, setSeasonFrom] = useState(product?.seasonal_from ?? "")
  const [seasonTo, setSeasonTo] = useState(product?.seasonal_to ?? "")
  const [sort, setSort] = useState(String(product?.sort ?? 100))
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const sb = createClient()
      const path = `${tenant}/${Date.now()}-${file.name.replace(/\s/g, "-")}`
      const { error: upError } = await sb.storage.from("product-images").upload(path, file)
      if (upError) throw upError
      const { data } = sb.storage.from("product-images").getPublicUrl(path)
      setImages((prev) => [...prev, data.publicUrl])
    } catch (e) {
      setError(e instanceof Error ? e.message : "ছবি আপলোড ব্যর্থ")
    } finally {
      setUploading(false)
    }
  }

  const save = () => {
    setError(null)
    if (!titleBn.trim() || !price) {
      setError("নাম ও দাম আবশ্যক")
      return
    }
    const finalSlug =
      slug.trim() ||
      titleBn
        .trim()
        .replace(/[^\u0980-\u09FF\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()

    const variants = variantsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, delta] = line.split("|")
        return { label: label.trim(), priceDelta: Number(delta?.trim() || 0) }
      })

    startTransition(async () => {
      const result = await saveProductAction({
        id: mode === "edit" ? product!.id : undefined,
        tenant,
        category_id: categoryId || null,
        slug: finalSlug,
        title_bn: titleBn.trim(),
        tagline_bn: tagline.trim() || null,
        description_bn: description.trim() || null,
        price_bdt: Number(price),
        compare_price_bdt: comparePrice ? Number(comparePrice) : null,
        images,
        variants,
        stock: stock === "" ? null : Number(stock),
        badge_bn: badge.trim() || null,
        is_active: isActive,
        is_featured: isFeatured,
        seasonal_from: seasonFrom || null,
        seasonal_to: seasonTo || null,
        sort: Number(sort) || 100,
      })
      if (result.ok) {
        router.push(`/admin/products?tenant=${tenant}`)
        router.refresh()
      } else {
        setError(result.error ?? "সেভ করা যায়নি")
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">
          {mode === "new" ? "➕ নতুন পণ্য" : "✏️ পণ্য সম্পাদনা"}
        </h1>
        <Link href={`/admin/products?tenant=${tenant}`} className="text-sm text-muted hover:text-primary">
          ← তালিকায় ফিরুন
        </Link>
      </div>

      <div className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7">
        <Field label="পণ্যের নাম (বাংলা) *">
          <input value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className={input} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL স্লাগ (খালি রাখলে নাম থেকে হবে)">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="misti-doi" className={input} />
          </Field>
          <Field label="ক্যাটাগরি">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input}>
              <option value="">— নেই —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name_bn}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="ট্যাগলাইন (ছোট মজার/আকর্ষণীয় লাইন)">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={input} />
        </Field>

        <Field label="বিস্তারিত বর্ণনা">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={input} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="দাম (৳) *">
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
          </Field>
          <Field label="আগের দাম (ক্রস-আউট)">
            <input type="number" min={0} value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className={input} />
          </Field>
          <Field label="স্টক (খালি = আনলিমিটেড)">
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className={input} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ভ্যারিয়েন্ট — প্রতি লাইনে একটি: নাম|অতিরিক্ত দাম">
            <textarea
              value={variantsText}
              onChange={(e) => setVariantsText(e.target.value)}
              rows={3}
              placeholder={"৫০০ গ্রাম|0\n১ কেজি|230"}
              className={input}
            />
          </Field>
          <div className="space-y-4">
            <Field label="ব্যাজ (যেমন: 🔥 ভাইরাল)">
              <input value={badge} onChange={(e) => setBadge(e.target.value)} className={input} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="মৌসুম শুরু">
                <input type="date" value={seasonFrom} onChange={(e) => setSeasonFrom(e.target.value)} className={input} />
              </Field>
              <Field label="মৌসুম শেষ">
                <input type="date" value={seasonTo} onChange={(e) => setSeasonTo(e.target.value)} className={input} />
              </Field>
            </div>
          </div>
        </div>

        <Field label="ছবি (সর্বোচ্চ ৫টি)">
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <div key={img} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setImages(images.filter((i) => i !== img))}
                  aria-label="সরান"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs text-muted hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? "..." : "আপলোড"}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-6 border-t border-dashed border-line pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            লাইভ (ক্রেতা দেখবে)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            ⭐ হোমপেজে ফিচার
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-muted">
            সর্ট:
            <input type="number" value={sort} onChange={(e) => setSort(e.target.value)} className="w-16 rounded-lg border border-line bg-bg px-2 py-1 text-sm" />
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          onClick={save}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display font-bold text-on-primary shadow-card hover:bg-primary-strong disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          💾 পণ্য সংরক্ষণ করুন
        </button>
      </div>
    </div>
  )
}

const input =
  "w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}
