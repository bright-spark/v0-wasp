import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat/chat-interface"

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: initialChats } = await supabase.from("chats").select("*").order("updated_at", { ascending: false })

  return <ChatInterface user={user} initialChats={initialChats || []} />
}
