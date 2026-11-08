"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Copy, Loader2, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  cartSubtotal,
  selectTenantItems,
  useCartStore,
} from "@/lib/cart-store"
import { DISTRICTS, zoneForDistrict } from "@/lib/districts"
import { bdt, makeOrderNo } from "@/lib/utils"
import type { PaymentMethod, ShopSettings } from "@/lib/types"

const schema = z.object({
  customer_name: z.string().min(2, "আপনার নাম লিখুন"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "১১ ডিজিটের সঠিক নম্বর দিন (01XXXXXXXXX)"),
  district: z.string().min(1, "জেলা বাছুন"),
  thana_area: z.string().optional(),
  address: z.string().min(8, "বিস্তারিত ঠিকানা লিখুন"),
  notes_bn: z.string().optional(),
  gift_message_bn: z.string().max(120, "১২০ অক্ষরের মধ্যে লিখুন").optional(),
  payment_method: z.enum(["cod", "bkash"]),
  bkash_sender: z.string().optional(),
  bkash_trx_id: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.payment_method !== "bkash") return
  if (!/^01[3-9]\d{8}$/.test((v.bkash_sender ?? "").trim())) {
    ctx.addIssue({ code: "custom", path: ["bkash_sender"], message: "যে বিকাশ নম্বর থেকে পাঠিয়েছেন সেটি দিন" })
  }
  if (!/^[A-Za-z0-9]{8,12}$/.test((v.bkash_trx_id ?? "").trim())) {
    ctx.addIssue({ code: "custom", path: ["bkash_trx_id"], message: "বিকাশ মেসেজের TrxID দিন (যেমন: 9BX3K7QZ1M)" })
  }
})

type FormValues = z.infer<typeof schema>

const ERROR_MESSAGES: Record<string, string> = {
  invalid_phone: "মোবাইল নম্বরটি সঠিক নয়",
  invalid_address: "ঠিকানাটি আরেকটু বিস্তারিত লিখুন",
  invalid_name: "নামটি ঠিকভাবে লিখুন",
  empty_cart: "কার্ট খালি!",
  product_unavailable: "একটি পণ্য এখন পাওয়া যাচ্ছে না — কার্ট আপডেট করুন",
  out_of_stock: "দুঃখিত! একটি পণ্যের স্টক ঠিক এখনই শেষ হয়ে গেল 😢",
  season_closed: "এই পণ্যের মৌসুম শেষ হয়ে গেছে",
  section_closed: "কার্টের একটি পণ্য এখন বিক্রি হচ্ছে না — কার্ট থেকে সরিয়ে দিন",
  invalid_trx: "ট্রানজেকশন আইডিটা ঠিক নেই, বিকাশ মেসেজ দেখে আবার লিখুন",
  invalid_sender: "বিকাশ নম্বরটি সঠিক নয়",
  trx_used: "এই TrxID দিয়ে আগেই একটা অর্ডার হয়েছে। সমস্যা হলে আমাদের WhatsApp করুন।",
  bkash_disabled: "এই মুহূর্তে বিকাশ পেমেন্ট বন্ধ, ক্যাশ অন ডেলিভারি বাছুন",
  cod_disabled: "এই মুহূর্তে ক্যাশ অন ডেলিভারি বন্ধ, বিকাশে পেমেন্ট করুন",
}

const BKASH_STEPS: Record<ShopSettings["bkash_account_type"], string> = {
  personal: "Send Money",
  agent: "Cash Out",
  merchant: "Payment",
}

export default function CheckoutForm({
  tenantSlug,
  settings,
}: {
  tenantSlug: string
  settings: ShopSettings
}) {
  const router = useRouter()
  const rawItems = useCartStore((s) => s.items)
  const clearTenant = useCartStore((s) => s.clearTenant)
  const items = selectTenantItems(rawItems, tenantSlug)
  const subtotal = cartSubtotal(items)

  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const methods: PaymentMethod[] = [
    ...(settings.cod_enabled ? (["cod"] as const) : []),
    ...(settings.bkash_enabled && settings.bkash_number ? (["bkash"] as const) : []),
  ]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { district: "", payment_method: methods[0] ?? "cod" },
  })

  const district = watch("district") ?? ""
  const zone = zoneForDistrict(district || "")
  const zoneFee =
    zone === "inside_dhaka" ? settings.delivery_fee_inside : settings.delivery_fee_outside
  const fee =
    settings.free_delivery_over !== null && subtotal >= settings.free_delivery_over ? 0 : zoneFee
  const total = subtotal + fee
  const method = watch("payment_method")

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(settings.bkash_number ?? "")
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const giftValue = watch("gift_message_bn") ?? ""

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    setSubmitting(true)

    const payload = {
      tenant: tenantSlug,
      zone,
      items: items.map((i) => ({
        product_id: i.productId,
        variant_label: i.variantLabel,
        qty: i.qty,
      })),
      ...values,
      bkash_sender: values.payment_method === "bkash" ? values.bkash_sender?.trim() : null,
      bkash_trx_id:
        values.payment_method === "bkash" ? values.bkash_trx_id?.trim().toUpperCase() : null,
    }

    let result: { ok?: boolean; order_no?: string; total?: number; error?: string }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        const sb = createClient()
        const { data, error } = await sb.rpc("place_order", { payload })
        if (error) throw new Error(error.message)
        result = data as typeof result
      } catch {
        result = { ok: false, error: "network" }
      }
    } else {
      // Demo mode — simulate a successful order
      await new Promise((r) => setTimeout(r, 900))
      result = { ok: true, order_no: makeOrderNo(), total }
    }

    if (!result.ok) {
      setServerError(
        ERROR_MESSAGES[result.error ?? ""] ??
          "কিছু একটা সমস্যা হয়েছে! একটু পরে আবার চেষ্টা করুন।",
      )
      setSubmitting(false)
      return
    }

    clearTenant(tenantSlug)
    router.push(
      `/order-success?no=${result.order_no}&total=${result.total}&pay=${values.payment_method}`,
    )
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
        <span className="text-6xl">🛒</span>
        <p className="mt-4 font-display text-xl font-bold">কার্ট তো খালি!</p>
        <p className="mt-1.5 text-sm text-muted">আগে কিছু মজার/মিষ্টি জিনিস কার্টে দিন 😊</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-7 py-3 font-display font-bold text-on-primary shadow-card transition-transform hover:scale-105"
        >
          শপে যান →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* ---------- FORM ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7"
      >
        <h2 className="font-display text-lg font-bold">📦 ডেলিভারির তথ্য</h2>

        <Field label="আপনার নাম *" error={errors.customer_name?.message}>
          <input
            {...register("customer_name")}
            placeholder="যেমন: রহিম উদ্দিন"
            className={inputCls(errors.customer_name)}
          />
        </Field>

        <Field label="মোবাইল নম্বর *" error={errors.phone?.message}>
          <input
            {...register("phone")}
            inputMode="numeric"
            maxLength={11}
            placeholder="01XXXXXXXXX"
            className={inputCls(errors.phone)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="জেলা *" error={errors.district?.message}>
            <select {...register("district")} className={inputCls(errors.district)}>
              <option value="">— জেলা বাছুন —</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="থানা / এলাকা">
            <input {...register("thana_area")} placeholder="যেমন: মিরপুর" className={inputCls()} />
          </Field>
        </div>

        {district && (
          <p className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-xs font-medium text-muted">
            {zone === "inside_dhaka" ? "🏙️" : "🚌"} ডেলিভারি:{" "}
            <b className="text-ink">
              {zone === "inside_dhaka" ? "ঢাকার ভিতরে · ২৪ ঘণ্টার মধ্যে" : "ঢাকার বাইরে · ৪৮–৭২ ঘণ্টায়"}
            </b>{" "}
            — ফি {fee === 0 ? <b className="text-emerald-600">ফ্রি!</b> : bdt(fee)}
          </p>
        )}

        <Field label="বিস্তারিত ঠিকানা *" error={errors.address?.message}>
          <textarea
            {...register("address")}
            rows={3}
            placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা — যেন ডেলিভারি ম্যান সহজে খুঁজে পায়"
            className={inputCls(errors.address)}
          />
        </Field>

        <Field label="ডেলিভারি নোট (অপশনাল)">
          <input
            {...register("notes_bn")}
            placeholder="যেমন: বিকেলে কল দিয়ে আসবেন"
            className={inputCls()}
          />
        </Field>

        <Field
          label="🎁 উপহার হলে সাথে একটা নোট (অপশনাল)"
          hint={`${giftValue.length}/১২০`}
        >
          <textarea
            {...register("gift_message_bn")}
            rows={2}
            maxLength={120}
            placeholder="যেমন: গরুর জন্য গোবর, গাধার জন্য ঘাস — ভালো থাকো!"
            className={inputCls()}
          />
        </Field>

        {/* ---------- PAYMENT ---------- */}
        <div className="border-t border-dashed border-line pt-5">
          <h2 className="font-display text-lg font-bold">💳 পেমেন্ট কীভাবে করবেন?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {methods.includes("cod") && (
              <PayOption
                value="cod"
                current={method}
                title="💵 ক্যাশ অন ডেলিভারি"
                sub="পার্সেল হাতে পেয়ে টাকা দিন"
                register={register("payment_method")}
              />
            )}
            {methods.includes("bkash") && (
              <PayOption
                value="bkash"
                current={method}
                title="📱 বিকাশ"
                sub="এখনই পাঠান, অর্ডার আগে কনফার্ম হবে"
                register={register("payment_method")}
                bkash
              />
            )}
          </div>

          {method === "bkash" && settings.bkash_number && (
            <div className="mt-4 space-y-4 rounded-2xl border-2 border-[#e2136e]/25 bg-[#e2136e]/5 p-4 md:p-5">
              <ol className="space-y-2.5 text-sm leading-relaxed">
                <li>
                  <b>১.</b> বিকাশ অ্যাপে <b>{BKASH_STEPS[settings.bkash_account_type]}</b> করুন এই নম্বরে:
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-xl bg-white px-3 py-1.5 font-mono text-base font-bold tracking-wider text-[#e2136e] shadow-card">
                      {settings.bkash_number}
                    </span>
                    <button
                      type="button"
                      onClick={copyNumber}
                      className="flex items-center gap-1 rounded-full border border-[#e2136e]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#e2136e]"
                    >
                      <Copy size={12} /> {copied ? "কপি হয়েছে" : "কপি"}
                    </button>
                  </span>
                </li>
                <li>
                  <b>২.</b> পরিমাণ: <b className="text-[#e2136e]">{bdt(total)}</b>
                  {settings.bkash_account_type === "agent" && " (ক্যাশ আউট চার্জ আপনার)"}
                </li>
                <li>
                  <b>৩.</b> বিকাশের কনফার্মেশন মেসেজ থেকে <b>TrxID</b> নিচে লিখুন।
                </li>
              </ol>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="যে নম্বর থেকে পাঠিয়েছেন *" error={errors.bkash_sender?.message}>
                  <input
                    {...register("bkash_sender")}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="01XXXXXXXXX"
                    className={inputCls(errors.bkash_sender)}
                  />
                </Field>
                <Field label="ট্রানজেকশন আইডি (TrxID) *" error={errors.bkash_trx_id?.message}>
                  <input
                    {...register("bkash_trx_id")}
                    maxLength={12}
                    placeholder="যেমন: 9BX3K7QZ1M"
                    className={`${inputCls(errors.bkash_trx_id)} font-mono uppercase`}
                  />
                </Field>
              </div>
              <p className="text-[11px] text-muted">
                আমরা TrxID মিলিয়ে দেখে অর্ডার কনফার্ম করব। ভুল TrxID দিলে অর্ডার বাতিল হতে পারে।
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ---------- SUMMARY ---------- */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="h-fit space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card lg:sticky lg:top-24 md:p-6"
      >
        <h2 className="font-display text-lg font-bold">🧺 আপনার অর্ডার</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3 text-sm">
              <span className="text-muted">
                {item.title}
                {item.variantLabel && (
                  <span className="block text-xs opacity-70">{item.variantLabel}</span>
                )}
                <b className="text-ink"> ×{item.qty.toLocaleString("bn-BD")}</b>
              </span>
              <span className="shrink-0 font-semibold">{bdt(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-dashed border-line pt-4 text-sm">
          <Row label="সাবটোটাল" value={bdt(subtotal)} />
          <Row
            label="ডেলিভারি ফি"
            value={fee === 0 ? "ফ্রি 🎉" : bdt(fee)}
            highlight={fee === 0}
          />
          <div className="flex justify-between pt-1 font-display text-lg font-black">
            <span>সর্বমোট</span>
            <span className="text-primary">{bdt(total)}</span>
          </div>
        </div>

        {serverError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {serverError}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-display text-base font-bold text-on-primary shadow-card transition-colors hover:bg-primary-strong disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              পাঠানো হচ্ছে...
            </>
          ) : (
            <>✅ অর্ডার কনফার্ম করুন</>
          )}
        </motion.button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
          <Lock size={11} />
          {method === "bkash"
            ? "📱 বিকাশ পেমেন্ট যাচাই করে অর্ডার কনফার্ম করা হবে"
            : "💵 ক্যাশ অন ডেলিভারি — পার্সেল হাতে পেয়ে টাকা দিন"}
        </p>
      </motion.aside>
    </form>
  )
}

function PayOption({
  value,
  current,
  title,
  sub,
  register,
  bkash,
}: {
  value: PaymentMethod
  current: PaymentMethod
  title: string
  sub: string
  register: UseFormRegisterReturn
  bkash?: boolean
}) {
  const active = current === value
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
        active
          ? bkash
            ? "border-[#e2136e] bg-[#e2136e]/5"
            : "border-primary bg-accent-soft/40"
          : "border-line bg-bg hover:border-primary/50"
      }`}
    >
      <input type="radio" value={value} {...register} className="mt-1 h-4 w-4 accent-[var(--primary)]" />
      <span>
        <span className="block font-display font-bold">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
    </label>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={highlight ? "font-semibold text-emerald-600" : "font-semibold"}>
        {value}
      </span>
    </div>
  )
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
        {label}
        {hint && <span className="opacity-70">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  )
}

function inputCls(error?: unknown) {
  return `w-full rounded-2xl border bg-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    error ? "border-red-400" : "border-line"
  }`
}
