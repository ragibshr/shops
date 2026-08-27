"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import type { TenantMall } from "@/lib/tenants"
import type { Category } from "@/lib/types"

interface Props {
  mall: TenantMall
  categories: Category[]
  onRackClick: (categorySlug: string) => void
  onExit: () => void
}

export default function ShopInterior({ mall, categories, onRackClick, onExit }: Props) {
  const [hoveredRack, setHoveredRack] = useState<string | null>(null)

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-gradient-to-b from-amber-50 to-emerald-50">
      {/* Interior illustration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mall.interiorImage}
        alt="দোকানের ভিতরে"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
      />

      {/* Fallback when image missing */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <div className="rounded-[3rem] border-4 border-dashed border-amber-200 bg-white/50 px-10 py-8 text-center backdrop-blur-sm">
          <p className="text-5xl">🏬</p>
          <p className="mt-3 font-display text-base font-bold text-amber-700">
            দোকানের ভিতরের ছবি শীঘ্রই আসছে
          </p>
        </div>
      </div>

      {/* Rack hotspots */}
      {mall.racks.map((rack) => {
        const cat = categories.find((c) => c.slug === rack.categorySlug)
        const isHovered = hoveredRack === rack.id

        return (
          <motion.button
            key={rack.id}
            onClick={() => onRackClick(rack.categorySlug)}
            onMouseEnter={() => setHoveredRack(rack.id)}
            onMouseLeave={() => setHoveredRack(null)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="absolute z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-white/60 bg-white/70 shadow-lg backdrop-blur-sm transition-all hover:border-primary hover:bg-white/90 hover:shadow-xl"
            style={{
              left: rack.area.left,
              top: rack.area.top,
              width: rack.area.width,
              height: rack.area.height,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="text-3xl md:text-4xl">{rack.emoji}</span>
            <span className="mt-1 font-display text-xs font-bold text-ink md:text-sm">
              {rack.label}
            </span>
            {cat && (
              <span className="mt-0.5 text-[10px] text-muted">
                {cat.name_bn}
              </span>
            )}
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-on-primary"
              >
                দেখুন →
              </motion.span>
            )}
          </motion.button>
        )
      })}

      {/* Back button */}
      <motion.button
        onClick={onExit}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 left-6 z-10 flex items-center gap-1.5 rounded-full border border-white/50 bg-white/80 px-4 py-2 font-display text-xs font-bold text-ink shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
      >
        <ArrowLeft size={14} />
        বাইরে যান
      </motion.button>
    </section>
  )
}
