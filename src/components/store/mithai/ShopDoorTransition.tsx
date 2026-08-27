"use client"

import { motion } from "framer-motion"
import type { TenantMall } from "@/lib/tenants"

interface Props {
  mall: TenantMall
  onComplete: () => void
}

export default function ShopDoorTransition({ mall, onComplete }: Props) {
  return (
    <motion.section
      className="fixed inset-0 z-50 h-dvh w-full overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Exterior zooming in */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.8 }}
        transition={{ duration: 0.7, ease: "easeIn" }}
        onAnimationComplete={onComplete}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mall.exteriorImage}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
        {/* Fallback gradient while image loads */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-amber-100" />
      </motion.div>

      {/* Fade-out overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
    </motion.section>
  )
}
