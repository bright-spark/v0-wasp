"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import type { Chat, Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import { Menu, Send, Plus } from "lucide-react"
import { useChat } from "ai/react"
import { getMessages } from "@/lib/actions/chat-actions"

interface ChatMainProps {
  user: User
  currentChat: Chat | null
  messages: Message[]
  onToggleSidebar: () => void
  onNewChat: () => Promise<Chat | null>
  onAddMessage: (message: Message) => void
  onUpdateChatTitle: (chatId: string, title: string) => void
  onSetMessages: (messages: Message[]) => void
}

export function ChatMain({
  user,
  currentChat,
  messages,
  onToggleSidebar,
  onNewChat,
  onAddMessage,
  onUpdateChatTitle,
  onSetMessages,
}: ChatMainProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    messages: aiMessages,
    handleSubmit: handleAISubmit,
    isLoading,
    setMessages: setAIMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId: currentChat?.id,
    },
    onFinish: async (message) => {
      if (currentChat && messages.length === 0) {
        const title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
        await onUpdateChatTitle(currentChat.id, title)
      }
    },
  })

  useEffect(() => {
    if (currentChat) {
      getMessages(currentChat.id).then((dbMessages) => {
        onSetMessages(dbMessages)
        const aiFormattedMessages = dbMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
        setAIMessages(aiFormattedMessages)
      })
    } else {
      onSetMessages([])
      setAIMessages([])
    }
  }, [currentChat, onSetMessages, setAIMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const messageContent = input.trim()
    setInput("")

    try {
      let chatToUse = currentChat

      // Create new chat if none exists
      if (!chatToUse) {
        chatToUse = await onNewChat()
        if (!chatToUse) return
      }

      await handleAISubmit(e, {
        data: {
          chatId: chatToUse.id,
          message: messageContent,
        },
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Use AI messages for display, which includes streaming
  const displayMessages = currentChat ? aiMessages : []

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-primary-foreground rounded-md"></div>
              </div>
            </div>
            <h1 className="text-4xl font-semibold text-foreground mb-4 text-balance">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.
            </h1>
            <p className="text-muted-foreground mb-8">How can I help you today?</p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start bg-transparent"
                onClick={onNewChat}
              >
                <div>
                  <div className="font-medium">Write</div>
                  <div className="text-xs text-muted-foreground">Create content</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start bg-transparent"
                onClick={onNewChat}
              >
                <div>
                  <div className="font-medium">Learn</div>
                  <div className="text-xs text-muted-foreground">Explore topics</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start bg-transparent"
                onClick={onNewChat}
              >
                <div>
                  <div className="font-medium">Code</div>
                  <div className="text-xs text-muted-foreground">Programming help</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start bg-transparent"
                onClick={onNewChat}
              >
                <div>
                  <div className="font-medium">Analyze</div>
                  <div className="text-xs text-muted-foreground">Data insights</div>
                </div>
              </Button>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                className="min-h-[60px] pr-12 resize-none bg-background border-border"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-card-foreground truncate">{currentChat.title}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onNewChat} className="flex-shrink-0">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {displayMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Start a conversation...</div>
          ) : (
            displayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  id: message.id,
                  chat_id: currentChat.id,
                  role: message.role,
                  content: message.content,
                  created_at: new Date().toISOString(),
                }}
                isLoading={isLoading && message.role === "assistant" && message.content === ""}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to Claude..."
              className="min-h-[60px] pr-12 resize-none bg-background border-border"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-muted-foreground text-center mt-2">
            Claude can make mistakes. Please double-check responses.
          </div>
        </div>
      </div>
    </div>
  )
}
