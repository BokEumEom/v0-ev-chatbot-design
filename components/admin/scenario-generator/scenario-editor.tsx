"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ChatScenario } from "@/data/chatbot-scenarios"
import { PlusCircle, Trash2, Save, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScenarioEditorProps {
  scenario: ChatScenario
  onSave: (scenario: ChatScenario) => Promise<void>
  onCancel: () => void
}

export function ScenarioEditor({ scenario, onSave, onCancel }: ScenarioEditorProps) {
  const [editedScenario, setEditedScenario] = useState<ChatScenario>({ ...scenario })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditedScenario({ ...scenario })
  }, [scenario])

  const handleChange = (field: keyof ChatScenario, value: any) => {
    setEditedScenario((prev) => ({ ...prev, [field]: value }))
  }

  const handleConversationChange = (
    index: number,
    field: keyof (typeof editedScenario.conversations)[0],
    value: any,
  ) => {
    const updatedConversations = [...editedScenario.conversations]
    updatedConversations[index] = { ...updatedConversations[index], [field]: value }
    handleChange("conversations", updatedConversations)
  }

  const handleEntityChange = (conversationIndex: number, key: string, value: string) => {
    const updatedConversations = [...editedScenario.conversations]
    const currentEntities = updatedConversations[conversationIndex].entities || {}
    updatedConversations[conversationIndex].entities = { ...currentEntities, [key]: value }
    handleChange("conversations", updatedConversations)
  }

  const handleRemoveEntity = (conversationIndex: number, key: string) => {
    const updatedConversations = [...editedScenario.conversations]
    const currentEntities = { ...updatedConversations[conversationIndex].entities }
    delete currentEntities[key]
    updatedConversations[conversationIndex].entities = currentEntities
    handleChange("conversations", updatedConversations)
  }

  const handleAddEntity = (conversationIndex: number) => {
    const updatedConversations = [...editedScenario.conversations]
    const currentEntities = updatedConversations[conversationIndex].entities || {}
    updatedConversations[conversationIndex].entities = { ...currentEntities, new_entity: "값" }
    handleChange("conversations", updatedConversations)
  }

  const handleAddConversation = () => {
    const updatedConversations = [...editedScenario.conversations]
    updatedConversations.push({
      user: "",
      bot: "",
      intent: "",
      entities: {},
      notes: "",
    })
    handleChange("conversations", updatedConversations)
  }

  const handleRemoveConversation = (index: number) => {
    const updatedConversations = [...editedScenario.conversations]
    updatedConversations.splice(index, 1)
    handleChange("conversations", updatedConversations)
  }

  const handleAddKeyFeature = () => {
    const updatedKeyFeatures = [...(editedScenario.keyFeatures || [])]
    updatedKeyFeatures.push("")
    handleChange("keyFeatures", updatedKeyFeatures)
  }

  const handleKeyFeatureChange = (index: number, value: string) => {
    const updatedKeyFeatures = [...(editedScenario.keyFeatures || [])]
    updatedKeyFeatures[index] = value
    handleChange("keyFeatures", updatedKeyFeatures)
  }

  const handleRemoveKeyFeature = (index: number) => {
    const updatedKeyFeatures = [...(editedScenario.keyFeatures || [])]
    updatedKeyFeatures.splice(index, 1)
    handleChange("keyFeatures", updatedKeyFeatures)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(editedScenario)
    } catch (error) {
      console.error("시나리오 저장 오류:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>시나리오 편집</CardTitle>
            <CardDescription>시나리오 내용을 수정하고 저장하세요.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form id="scenario-editor-form" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="conversations">대화 내용</TabsTrigger>
              <TabsTrigger value="features">핵심 기능</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Input
                    id="category"
                    value={editedScenario.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id">ID</Label>
                  <Input
                    id="id"
                    value={editedScenario.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={editedScenario.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={editedScenario.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="conversations">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {editedScenario.conversations.map((conversation, index) => (
                    <Card key={index} className="relative">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => handleRemoveConversation(index)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">대화 {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`user-${index}`}>사용자 메시지</Label>
                          <Textarea
                            id={`user-${index}`}
                            value={conversation.user}
                            onChange={(e) => handleConversationChange(index, "user", e.target.value)}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`bot-${index}`}>챗봇 응답</Label>
                          <Textarea
                            id={`bot-${index}`}
                            value={conversation.bot}
                            onChange={(e) => handleConversationChange(index, "bot", e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`intent-${index}`}>인텐트</Label>
                          <Input
                            id={`intent-${index}`}
                            value={conversation.intent || ""}
                            onChange={(e) => handleConversationChange(index, "intent", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>엔티티</Label>
                            <Button variant="outline" size="sm" onClick={() => handleAddEntity(index)} type="button">
                              <PlusCircle className="h-3 w-3 mr-1" />
                              추가
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {conversation.entities &&
                              Object.entries(conversation.entities).map(([key, value]) => (
                                <div key={key} className="flex gap-2 items-center">
                                  <Input
                                    value={key}
                                    onChange={(e) => {
                                      const newKey = e.target.value
                                      const updatedConversations = [...editedScenario.conversations]
                                      const currentEntities = { ...updatedConversations[index].entities }
                                      const currentValue = currentEntities[key]
                                      delete currentEntities[key]
                                      currentEntities[newKey] = currentValue
                                      updatedConversations[index].entities = currentEntities
                                      handleChange("conversations", updatedConversations)
                                    }}
                                    placeholder="키"
                                    className="flex-1"
                                  />
                                  <Input
                                    value={value as string}
                                    onChange={(e) => handleEntityChange(index, key, e.target.value)}
                                    placeholder="값"
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveEntity(index, key)}
                                    type="button"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`notes-${index}`}>처리 특징</Label>
                          <Textarea
                            id={`notes-${index}`}
                            value={conversation.notes || ""}
                            onChange={(e) => handleConversationChange(index, "notes", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" className="w-full" onClick={handleAddConversation} type="button">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    대화 추가
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="space-y-4">
                {editedScenario.keyFeatures?.map((feature, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={feature}
                      onChange={(e) => handleKeyFeatureChange(index, e.target.value)}
                      placeholder="핵심 기능"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveKeyFeature(index)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={handleAddKeyFeature} type="button">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  핵심 기능 추가
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" form="scenario-editor-form" disabled={isSaving}>
          {isSaving ? (
            <>저장 중...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              저장
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
