"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMain } from "./chat-main"
import type { Chat, Message } from "@/lib/types"
import { createChat, updateChatTitle } from "@/lib/actions/chat-actions"

interface ChatInterfaceProps {
  user: User
  initialChats: Chat[]
}

export function ChatInterface({ user, initialChats }: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateNewChat = async (title = "New conversation") => {
    try {
      setIsLoading(true)
      const newChat = await createChat(title)

      if (newChat) {
        setChats((prev) => [newChat, ...prev])
        setCurrentChat(newChat)
        setMessages([])
        setSidebarOpen(false)
        return newChat
      }
      return null
    } catch (error) {
      console.error("Error creating chat:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat)
    // Messages will be loaded by the ChatMain component
    setMessages([])
    setSidebarOpen(false)
  }

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const handleUpdateChatTitle = async (chatId: string, title: string) => {
    try {
      const success = await updateChatTitle(chatId, title)

      if (success) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)))

        if (currentChat?.id === chatId) {
          setCurrentChat((prev) => (prev ? { ...prev, title } : null))
        }
      }
    } catch (error) {
      console.error("Error updating chat title:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        user={user}
        chats={chats}
        currentChat={currentChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectChat={selectChat}
        onNewChat={handleCreateNewChat}
        isLoading={isLoading}
      />
      <ChatMain
        user={user}
        currentChat={currentChat}
        messages={messages}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleCreateNewChat}
        onAddMessage={addMessage}
        onUpdateChatTitle={handleUpdateChatTitle}
        onSetMessages={setMessages}
      />
    </div>
  )
}
