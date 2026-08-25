import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isLiveMode } from "@/lib/data"
import Sidebar from "@/components/admin/Sidebar"

export const metadata = { title: "অ্যাডমিন প্যানেল" }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!isLiveMode()) {
    return (
      <SetupNotice />
    )
  }
  const session = await getSession()
  if (!session) redirect("/admin/login")

  return (
    <Sidebar
      fullName={session.profile.full_name}
      role={session.profile.role}
      email={session.email ?? ""}
    >
      {children}
    </Sidebar>
  )
}

function SetupNotice() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="max-w-md rounded-3xl border border-dashed border-line bg-surface p-10 text-center shadow-card">
        <p className="text-5xl">🛠️</p>
        <h1 className="mt-4 font-display text-xl font-extrabold">
          Supabase এখনো সংযুক্ত হয়নি
        </h1>
        <p className="mt-3 text-left text-sm leading-relaxed text-muted">
          অ্যাডমিন প্যানেল চালাতে প্রথমে একটি Supabase প্রজেক্ট বানিয়ে{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">.env.local</code> ফাইলে
          keys বসান, তারপর{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
            supabase/migrations/0001_init.sql
          </code>{" "}
          ফাইলটি SQL Editor-এ চালান। বিস্তারিত ধাপ README তে আছে।
        </p>
      </div>
    </div>
  )
}
