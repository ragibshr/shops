"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { loginAction } from "@/app/admin/actions"

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, {})
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-card">
        <p className="text-center text-3xl">🔐</p>
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold">অ্যাডমিন লগইন</h1>
        <p className="mt-1.5 text-center text-xs text-muted">
          OddBox BD ও Mithe Bangla — কন্ট্রোল প্যানেল
        </p>

        <form action={action} className="mt-7 space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="ইমেইল"
            className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="পাসওয়ার্ড"
            className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {state?.error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display font-bold text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-60"
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            লগইন করুন
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted/70">
          অ্যাকাউন্ট শুধু মালিক তৈরি করতে পারেন। <br />
          <Link href="/" className="underline-offset-2 hover:underline">
            ← শপে ফিরুন
          </Link>
        </p>
      </div>
    </div>
  )
}
