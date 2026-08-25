"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Celebration({
  orderNo,
  total,
  whatsapp,
  isOddbox,
}: {
  orderNo: string
  total: number
  whatsapp: string
  isOddbox: boolean
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    import("canvas-confetti").then(({ default: confetti }) => {
      const fire = (ratio: number, opts: object) =>
        confetti({
          origin: { y: 0.7 },
          particleCount: Math.floor(220 * ratio),
          spread: 70,
          ...opts,
        })
      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2, { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      fire(0.1, { spread: 120, startVelocity: 45 })
    })
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderNo)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  const waText = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি ওয়েবসাইট থেকে অর্ডার করেছি। অর্ডার নম্বর: ${orderNo}`,
  )

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl shadow-card"
      >
        🎉
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 font-display text-3xl font-extrabold text-ink md:text-4xl"
      >
        {isOddbox ? "মজা পাঠানো হয়ে গেছে!" : "অর্ডার গ্রহণ করা হয়েছে!"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="mt-3 text-muted"
      >
        {isOddbox
          ? "আপনার উপহারটি এখন গোপন মিশনে বেরিয়েছে 😎"
          : "আমরা খুশি হলাম! টাটকা জিনিস পৌঁছে যাবে আপনার ঘরে।"}{" "}
        কনফার্মেশনের জন্য আমরা ফোনে যোগাযোগ করব।
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-3xl border border-line bg-surface p-6 text-left shadow-card"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              অর্ডার নম্বর
            </p>
            <p className="mt-1 font-mono text-xl font-bold tracking-wide text-primary">
              {orderNo || "—"}
            </p>
          </div>
          <button
            onClick={copy}
            className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:border-primary hover:text-primary"
          >
            {copied ? "✅ কপি হয়েছে" : "📋 কপি"}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-4">
          <span className="text-sm text-muted">ডেলিভারির সময় প্রদেয়</span>
          <span className="font-display text-xl font-black">{total.toLocaleString("bn-BD")}৳</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-7 grid gap-3 sm:grid-cols-2"
      >
        <a
          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#25D366] py-3.5 font-display text-sm font-bold text-white shadow-card transition-transform hover:scale-105"
        >
          💬 WhatsApp-এ নিশ্চিত করুন
        </a>
        <Link
          href="/track"
          className="rounded-full border-2 border-primary py-3.5 font-display text-sm font-bold text-primary transition-colors hover:bg-accent-soft"
        >
          🔍 অর্ডার ট্র্যাক করুন
        </Link>
      </motion.div>

      <Link href="/shop" className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:text-primary hover:underline">
        আরও কিছু দেখতে চান? শপে ফিরুন →
      </Link>
    </div>
  )
}
