import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Plain client — no cookie session needed (public endpoint)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ticketId } = await params
    const { body, senderName, senderType } = await req.json()

    if (!body || !senderName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender_type: senderType || "user",
        sender_name: senderName,
        body,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: data })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
