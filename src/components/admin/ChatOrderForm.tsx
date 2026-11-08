"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Copy, Loader2, Plus, Trash2 } from "lucide-react"
import { createChatOrderAction } from "@/app/admin/actions"
import { DISTRICTS, zoneForDistrict } from "@/lib/districts"
import { SOURCE_LABELS } from "@/lib/social"
import { bdt } from "@/lib/utils"
import type { OrderSource, PaymentMethod, Product, ShopSettings } from "@/lib/types"

const ERRORS: Record<string, string> = {
  invalid_phone: "কাস্টমারের মোবাইল নম্বর ঠিক নেই (01XXXXXXXXX)",
  invalid_address: "ঠিকানা আরেকটু বিস্তারিত লিখুন",
  invalid_name: "কাস্টমারের নাম লিখুন",
  empty_cart: "অন্তত একটা পণ্য যোগ করুন",
  product_unavailable: "একটা পণ্য এখন বন্ধ আছে",
  out_of_stock: "একটা পণ্যের যথেষ্ট স্টক নেই",
  section_closed: "এই সেকশন এখনো চালু হয়নি",
  invalid_variant: "একটা পণ্যের সাইজ/ধরন বাছুন",
  invalid_trx: "বিকাশ TrxID ঠিক নেই",
  invalid_sender: "বিকাশ নম্বর ঠিক নেই",
  trx_used: "এই TrxID দিয়ে আগেই অর্ডার হয়েছে",
  bkash_disabled: "সেটিংসে বিকাশ বন্ধ আছে",
  cod_disabled: "সেটিংসে ক্যাশ অন ডেলিভারি বন্ধ আছে",
}

const SOURCES: OrderSource[] = ["whatsapp", "messenger", "instagram", "facebook", "phone", "other"]

interface Line {
  key: number
  productId: string
  variant: string
  qty: number
}

export default function ChatOrderForm({
  products,
  settings,
  siteHost,
}: {
  products: Product[]
  settings: ShopSettings
  siteHost: string
}) {
  const [source, setSource] = useState<OrderSource>("whatsapp")
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", variant: "", qty: 1 }])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [district, setDistrict] = useState("")
  const [thana, setThana] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [gift, setGift] = useState("")
  const [method, setMethod] = useState<PaymentMethod>(settings.cod_enabled ? "cod" : "bkash")
  const [bkSender, setBkSender] = useState("")
  const [bkTrx, setBkTrx] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ no: string; total: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const unitPrice = (l: Line) => {
    const p = byId.get(l.productId)
    if (!p) return 0
    const v = p.variants?.find((x) => x.label === l.variant)
    return p.price_bdt + (v?.priceDelta ?? 0)
  }
  const subtotal = lines.reduce((s, l) => s + unitPrice(l) * l.qty, 0)
  const zone = zoneForDistrict(district)
  const zoneFee = zone === "inside_dhaka" ? settings.delivery_fee_inside : settings.delivery_fee_outside
  const fee = settings.free_delivery_over !== null && subtotal >= settings.free_delivery_over ? 0 : zoneFee
  const total = subtotal + (district ? fee : 0)

  const setLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const submit = () =>
    startTransition(async () => {
      setError(null)
      if (!district) return setError("জেলা বাছুন")
      const items = lines
        .filter((l) => l.productId)
        .map((l) => ({ product_id: l.productId, variant_label: l.variant || null, qty: l.qty }))
      const res = await createChatOrderAction({
        source,
        customer_name: name.trim(),
        phone: phone.trim(),
        district,
        zone,
        thana_area: thana.trim() || null,
        address: address.trim(),
        notes_bn: notes.trim() || null,
        gift_message_bn: gift.trim() || null,
        payment_method: method,
        bkash_sender: method === "bkash" ? bkSender.trim() : null,
        bkash_trx_id: method === "bkash" ? bkTrx.trim().toUpperCase() : null,
        items,
      })
      if (res.ok && res.order_no) setDone({ no: res.order_no, total: res.total ?? total })
      else setError(ERRORS[res.error ?? ""] ?? res.error ?? "সমস্যা হয়েছে")
    })

  if (done) {
    const reply =
      `ধন্যবাদ ${name.trim()}! আপনার অর্ডার নিশ্চিত হয়েছে ✅\n` +
      `অর্ডার নম্বর: ${done.no}\nমোট: ৳${done.total}` +
      (method === "cod" ? " (ডেলিভারির সময় দেবেন)" : " (বিকাশ যাচাই চলছে)") +
      `\nট্র্যাক করুন: https://${siteHost}/track`
    return (
      <div className="space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-card">
        <p className="font-display text-xl font-extrabold text-emerald-600">✅ অর্ডার তৈরি হয়েছে: {done.no}</p>
        <p className="text-sm text-muted">কাস্টমারকে চ্যাটে এই মেসেজটা পাঠিয়ে দিন:</p>
        <textarea readOnly value={reply} rows={5} className="w-full rounded-2xl border border-line bg-bg p-3 text-sm" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(reply)
                setCopied(true)
              } catch {}
            }}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
          >
            <Copy size={14} /> {copied ? "কপি হয়েছে" : "মেসেজ কপি"}
          </button>
          {source === "whatsapp" && (
            <a
              href={`https://wa.me/88${phone.trim()}?text=${encodeURIComponent(reply)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
            >
              WhatsApp-এ পাঠান
            </a>
          )}
          <Link href="/admin/orders" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">
            অর্ডার তালিকা
          </Link>
          <button onClick={() => window.location.reload()} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold">
            ➕ আরেকটা অর্ডার
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-6">
        <Field label="অর্ডার কোথা থেকে এলো?">
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                  source === s ? "border-primary bg-primary text-on-primary" : "border-line bg-bg text-muted"
                }`}
              >
                {SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        </Field>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">পণ্য</p>
          {lines.map((l) => {
            const p = byId.get(l.productId)
            return (
              <div key={l.key} className="flex flex-wrap items-center gap-2 rounded-2xl bg-bg p-2.5">
                <select
                  value={l.productId}
                  onChange={(e) => {
                    const np = byId.get(e.target.value)
                    setLine(l.key, { productId: e.target.value, variant: np?.variants?.[0]?.label ?? "" })
                  }}
                  className={`${input} min-w-0 flex-1`}
                >
                  <option value="">— পণ্য বাছুন —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title_bn} ({bdt(p.price_bdt)})
                      {p.stock !== null ? ` · স্টক ${p.stock}` : ""}
                    </option>
                  ))}
                </select>
                {p?.variants && p.variants.length > 0 && (
                  <select value={l.variant} onChange={(e) => setLine(l.key, { variant: e.target.value })} className={`${input} w-auto`}>
                    {p.variants.map((v) => (
                      <option key={v.label} value={v.label}>
                        {v.label}
                        {v.priceDelta ? ` (+${v.priceDelta}৳)` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={l.qty}
                  onChange={(e) => setLine(l.key, { qty: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })}
                  className={`${input} w-20 text-center`}
                  aria-label="পরিমাণ"
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                    aria-label="সরান"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )
          })}
          <button
            type="button"
            onClick={() => setLines((ls) => [...ls, { key: Date.now(), productId: "", variant: "", qty: 1 }])}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <Plus size={15} /> আরেকটা পণ্য
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="কাস্টমারের নাম *">
            <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </Field>
          <Field label="মোবাইল নম্বর *">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX" className={input} />
          </Field>
          <Field label="জেলা *">
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className={input}>
              <option value="">— জেলা বাছুন —</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="থানা / এলাকা">
            <input value={thana} onChange={(e) => setThana(e.target.value)} className={input} />
          </Field>
        </div>
        <Field label="বিস্তারিত ঠিকানা *">
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={input} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ডেলিভারি নোট">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={input} />
          </Field>
          <Field label="উপহার নোট">
            <input value={gift} onChange={(e) => setGift(e.target.value)} maxLength={120} className={input} />
          </Field>
        </div>

        <Field label="পেমেন্ট">
          <div className="flex flex-wrap gap-2">
            {settings.cod_enabled && (
              <button type="button" onClick={() => setMethod("cod")} className={`rounded-full border px-4 py-2 text-sm font-semibold ${method === "cod" ? "border-primary bg-primary text-on-primary" : "border-line"}`}>
                💵 ক্যাশ অন ডেলিভারি
              </button>
            )}
            {settings.bkash_enabled && (
              <button type="button" onClick={() => setMethod("bkash")} className={`rounded-full border px-4 py-2 text-sm font-semibold ${method === "bkash" ? "border-[#e2136e] bg-[#e2136e] text-white" : "border-line"}`}>
                📱 বিকাশ
              </button>
            )}
          </div>
        </Field>
        {method === "bkash" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="কোন নম্বর থেকে পাঠিয়েছে">
              <input value={bkSender} onChange={(e) => setBkSender(e.target.value)} maxLength={11} className={input} />
            </Field>
            <Field label="TrxID">
              <input value={bkTrx} onChange={(e) => setBkTrx(e.target.value)} maxLength={12} className={`${input} font-mono uppercase`} />
            </Field>
          </div>
        )}
      </div>

      <aside className="h-fit space-y-3 rounded-3xl border border-line bg-surface p-5 shadow-card lg:sticky lg:top-6">
        <p className="font-display font-bold">🧾 হিসাব</p>
        <Row label="সাবটোটাল" value={bdt(subtotal)} />
        <Row label="ডেলিভারি" value={!district ? "জেলা বাছুন" : fee === 0 ? "ফ্রি" : bdt(fee)} />
        <div className="flex justify-between border-t border-dashed border-line pt-2 font-display text-lg font-black">
          <span>মোট</span>
          <span className="text-primary">{bdt(total)}</span>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display font-bold text-on-primary disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />} অর্ডার তৈরি করুন
        </button>
        <p className="text-[11px] text-muted">চূড়ান্ত দাম আর ফি সার্ভার আবার হিসাব করবে।</p>
      </aside>
    </div>
  )
}

const input =
  "w-full rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
