export function bdt(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD")}`
}

export function bnDate(iso: string): string {
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function isValidBdPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(phone.trim())
}

export function makeOrderNo(tenant: string): string {
  const prefix = tenant === "mithai" ? "MB" : "OB"
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${ymd}-${rand}`
}

export function isSeasonalActive(
  from: string | null,
  to: string | null,
): boolean {
  if (!from && !to) return true
  const now = Date.now()
  if (from && now < new Date(from).getTime()) return false
  if (to && now > new Date(to + "T23:59:59").getTime()) return false
  return true
}
