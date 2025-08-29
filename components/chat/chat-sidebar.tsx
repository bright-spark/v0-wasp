"use client"
import type { User } from "@supabase/supabase-js"
import type { Chat } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Plus, MessageSquare, Settings, LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  user: User
  chats: Chat[]
  currentChat: Chat | null
  isOpen: boolean
  onToggle: () => void
  onSelectChat: (chat: Chat) => void
  onNewChat: () => void
  isLoading: boolean
}

export function ChatSidebar({
  user,
  chats,
  currentChat,
  isOpen,
  onToggle,
  onSelectChat,
  onNewChat,
  isLoading,
}: ChatSidebarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })
      if (response.ok) {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-sidebar-primary-foreground rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold text-sidebar-foreground">Claude</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            New chat
          </Button>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {isLoading ? (
              <div className="p-4 text-center text-sidebar-foreground/60">Loading conversations...</div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-sidebar-foreground/60">No conversations yet</div>
            ) : (
              chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "w-full justify-start p-3 h-auto text-left hover:bg-sidebar-accent",
                    currentChat?.id === chat.id && "bg-sidebar-accent",
                  )}
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <MessageSquare className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-sidebar-foreground truncate">{chat.title}</div>
                      <div className="text-xs text-sidebar-foreground/60">{formatDate(chat.updated_at)}</div>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* User Menu */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <div className="text-xs text-sidebar-foreground/60 truncate">{user.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}
