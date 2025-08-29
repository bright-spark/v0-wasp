"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Chat, Message } from "@/lib/types"

export async function getChats(): Promise<Chat[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error loading chats:", error)
    return []
  }

  return chats || []
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const supabase = await createClient()

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error loading messages:", error)
    return []
  }

  return messages || []
}

export async function createChat(title = "New conversation"): Promise<Chat | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: newChat, error } = await supabase
    .from("chats")
    .insert({
      user_id: user.id,
      title,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating chat:", error)
    return null
  }

  revalidatePath("/chat")
  return newChat
}

export async function updateChatTitle(chatId: string, title: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("chats")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", chatId)

  if (error) {
    console.error("Error updating chat title:", error)
    return false
  }

  revalidatePath("/chat")
  return true
}

export async function saveMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
): Promise<Message | null> {
  const supabase = await createClient()

  const { data: newMessage, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      role,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving message:", error)
    return null
  }

  revalidatePath("/chat")
  return newMessage
}
