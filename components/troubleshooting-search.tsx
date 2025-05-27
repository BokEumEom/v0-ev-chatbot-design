"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SearchProps {
  onSearch: (query: string) => void
  popularQueries: string[]
}

export function TroubleshootingSearch({ onSearch, popularQueries }: SearchProps) {
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // 로컬 스토리지에서 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem("troubleshooting-recent-searches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse recent searches", e)
      }
    }
  }, [])

  // 최근 검색어 저장
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const updated = [searchQuery, ...recentSearches.filter((item) => item !== searchQuery)].slice(0, 5) // 최대 5개까지만 저장

    setRecentSearches(updated)
    localStorage.setItem("troubleshooting-recent-searches", JSON.stringify(updated))
  }

  const handleSearch = () => {
    if (!query.trim()) return
    saveRecentSearch(query)
    onSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="relative">
          <Input
            placeholder="문제를 검색하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* 인기 검색어 */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">인기 검색어</p>
          <div className="flex flex-wrap gap-2">
            {popularQueries.map((term, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  setQuery(term)
                  onSearch(term)
                }}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>

        {/* 최근 검색어 */}
        {recentSearches.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">최근 검색어</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => {
                  setRecentSearches([])
                  localStorage.removeItem("troubleshooting-recent-searches")
                }}
              >
                전체 삭제
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setQuery(term)
                    onSearch(term)
                  }}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
