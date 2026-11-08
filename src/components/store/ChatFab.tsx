"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { useTenant } from "@/components/store/StoreProvider"

/** Floating "chat with us" button — WhatsApp and Messenger. */
export default function ChatFab() {
  const { links } = useTenant()
  const [open, setOpen] = useState(false)
  if (!links.whatsapp && !links.messenger) return null

  const hello = "আসসালামু আলাইকুম! অডবক্স থেকে কিছু অর্ডার করতে চাই।"

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-64 overflow-hidden rounded-3xl border border-line bg-surface shadow-pop"
          >
            <p className="bg-ink px-4 py-3 font-display text-sm font-bold text-white">
              চ্যাটে অর্ডার করুন 💬
              <span className="block text-[11px] font-normal opacity-75">
                সাধারণত কয়েক মিনিটেই উত্তর দিই
              </span>
            </p>
            <div className="space-y-2 p-3">
              {links.whatsapp && (
                <a
                  href={`${links.whatsapp}?text=${encodeURIComponent(hello)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
              )}
              {links.messenger && (
                <a
                  href={links.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-[#0084FF] px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  <Send size={17} /> Messenger
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "চ্যাট বন্ধ করুন" : "চ্যাটে অর্ডার করুন"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-pop transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
