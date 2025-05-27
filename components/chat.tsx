"use client"

import type React from "react"

import { useChat } from "ai/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Loader2, Send, MapPin, CreditCard, HelpCircle, AlertTriangle, ClipboardList } from "lucide-react"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [quickPrompts, setQuickPrompts] = useState([
    { icon: <AlertTriangle className="h-4 w-4" />, text: "Report a broken charger" },
    { icon: <HelpCircle className="h-4 w-4" />, text: "How to charge?" },
    { icon: <MapPin className="h-4 w-4" />, text: "Find available chargers nearby" },
    { icon: <CreditCard className="h-4 w-4" />, text: "Payment issues" },
    { icon: <ClipboardList className="h-4 w-4" />, text: "View charging history" },
  ])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleQuickPrompt = (prompt: string) => {
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>

    // Set the input value and submit the form
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>)
    setTimeout(() => handleSubmit(fakeEvent), 100)
  }

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-4">
              <img src="/placeholder.svg?key=h5wjj" alt="EV Charging Station" className="w-24 h-24 mb-4" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to EV Charging Assistant</h3>
            <p className="text-gray-500 mb-6">How can I help with your charging needs today?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left"
                  onClick={() => handleQuickPrompt(prompt.text)}
                >
                  <span className="mr-2">{prompt.icon}</span>
                  <span className="truncate">{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start max-w-[80%]">
                  {message.role !== "user" && (
                    <Avatar className="mr-2 h-8 w-8">
                      <div className="bg-green-600 h-full w-full flex items-center justify-center text-white font-semibold">
                        EV
                      </div>
                    </Avatar>
                  )}
                  <Card
                    className={`p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </Card>
                  {message.role === "user" && (
                    <Avatar className="ml-2 h-8 w-8">
                      <div className="bg-gray-800 h-full w-full flex items-center justify-center text-white font-semibold">
                        U
                      </div>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about charging stations..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
