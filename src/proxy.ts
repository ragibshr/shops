import { NextResponse, type NextRequest } from "next/server"

const HOST_TO_TENANT: Record<string, string> = {
  "oddboxbd.shop": "oddbox",
  "www.oddboxbd.shop": "oddbox",
  "mithebangla.shop": "mithai",
  "www.mithebangla.shop": "mithai",
}

export default function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0]
  const tenant = HOST_TO_TENANT[host] ?? process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "oddbox"

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-tenant", tenant)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|products).*)"],
}
