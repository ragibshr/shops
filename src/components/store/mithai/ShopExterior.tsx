"use client"

import { motion } from "framer-motion"
import type { TenantMall } from "@/lib/tenants"

interface Props {
  mall: TenantMall
  shopName: string
  tagline: string
  onEnter: () => void
}

export default function ShopExterior({ mall, shopName, tagline, onEnter }: Props) {
  return (
    <section className="relative h-dvh w-full overflow-hidden bg-gradient-to-b from-emerald-50 to-emerald-100">
      {/* Illustration or placeholder */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mall.exteriorImage}
        alt={shopName}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
      />

      {/* Fallback when image missing */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50">
        <div className="rounded-[3rem] border-4 border-dashed border-emerald-300 bg-white/60 px-12 py-10 text-center backdrop-blur-sm">
          <p className="text-6xl">🏪</p>
          <p className="mt-4 font-display text-lg font-bold text-emerald-800">
            দোকানের বাইরের ছবি শীঘ্রই আসছে
          </p>
          <p className="mt-1 text-sm text-emerald-600/70">
            AI-জেনারেটেড ইলাস্ট্রেশন এখানে দেখা যাবে
          </p>
        </div>
      </div>

      {/* Hero text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-display text-4xl font-extrabold drop-shadow-lg md:text-6xl"
        >
          {shopName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 text-base font-medium drop-shadow md:text-xl"
        >
          {tagline}
        </motion.p>
      </div>

      {/* Door hotspot */}
      <motion.button
        onClick={onEnter}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="absolute z-10 flex flex-col items-center gap-1"
        style={{
          left: mall.doorHotspot.left,
          top: mall.doorHotspot.top,
          width: mall.doorHotspot.width,
          height: mall.doorHotspot.height,
          transform: "translate(-50%, -50%)",
        }}
      >
        <span className="rounded-full bg-white/90 px-5 py-2.5 font-display text-sm font-bold text-emerald-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-white">
          🚪 ঢুকুন
        </span>
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-xs text-white/90 drop-shadow"
        >
          ▼ দরজায় ক্লিক করুন
        </motion.span>
      </motion.button>
    </section>
  )
}
