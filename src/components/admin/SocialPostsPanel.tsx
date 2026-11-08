"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { addSocialPostAction, deleteSocialPostAction } from "@/app/admin/actions"
import type { SocialPost } from "@/lib/types"

export default function SocialPostsPanel({ posts }: { posts: SocialPost[] }) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const add = () =>
    startTransition(async () => {
      setError(null)
      const res = await addSocialPostAction(url, null)
      if (res.ok) setUrl("")
      else setError(res.error ?? "সমস্যা হয়েছে")
    })

  const remove = (id: number) =>
    startTransition(async () => {
      await deleteSocialPostAction(id)
    })

  return (
    <section className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7">
      <div>
        <h2 className="font-display text-lg font-extrabold">🎬 হোমপেজের রিলস</h2>
        <p className="mt-1 text-sm text-muted">
          Instagram বা Facebook-এ নতুন রিল দিলে তার লিংক এখানে পেস্ট করুন, হোমপেজে দেখাবে (সর্বোচ্চ ৬টা)।
          রিলে “…” → “Copy link” চাপলেই লিংক পাবেন।
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/…"
          className="min-w-0 flex-1 rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={add}
          disabled={pending || !url.trim()}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 font-display text-sm font-bold text-on-primary disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />} যোগ করুন
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {posts.length > 0 ? (
        <ul className="divide-y divide-line/60 rounded-2xl border border-line">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span>{p.platform === "instagram" ? "📸" : "📘"}</span>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-muted hover:text-primary">
                {p.url}
              </a>
              <button
                onClick={() => remove(p.id)}
                disabled={pending}
                aria-label="মুছুন"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          এখনো কোনো রিল যোগ করা হয়নি। রিল না থাকলে হোমপেজে শুধু “ফলো করুন” বাটন দেখাবে।
        </p>
      )}
    </section>
  )
}
