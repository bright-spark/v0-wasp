import { streamText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { saveMessage } from "@/lib/actions/chat-actions"
import type { NextRequest } from "next/server"

// Configure OpenRouter (OpenAI-compatible API)
const openrouter = {
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId, message } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Verify chat belongs to user
    if (chatId) {
      const { data: chat, error: chatError } = await supabase.from("chats").select("user_id").eq("id", chatId).single()

      if (chatError || chat?.user_id !== user.id) {
        return new Response("Forbidden", { status: 403 })
      }
    }

    if (chatId && message) {
      await saveMessage(chatId, "user", message)
    }

    // Create AI stream using OpenRouter
    const result = await streamText({
      model: {
        provider: "openai",
        apiKey: openrouter.apiKey,
        baseURL: openrouter.baseURL,
        modelId: "anthropic/claude-3.5-sonnet",
      },
      messages: messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) || [{ role: "user", content: message }],
      system: `You are Claude, a helpful AI assistant created by Vercel. You are knowledgeable, thoughtful, and aim to be helpful while being honest about your limitations. Respond in a conversational and friendly manner.`,
      temperature: 0.7,
      maxTokens: 2048,
      onFinish: async (result) => {
        if (chatId) {
          await saveMessage(chatId, "assistant", result.text)
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
