"use client"

import { useState, useMemo, useCallback } from "react"
import { Timer } from "@/components/timer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TimerListProps {
  timers: Timer[]
  categories: string[]
  onStart: (id: string) => void
  onPause: (id: string) => void
  onReset: (id: string) => void
  onStartAll: (category: string) => void
  onPauseAll: (category: string) => void
  onResetAll: (category: string) => void
  activeCategory: string | null
  setActiveCategory: (category: string | null) => void
}

export function TimerList({
  timers,
  categories,
  onStart,
  onPause,
  onReset,
  onStartAll,
  onPauseAll,
  onResetAll,
}: TimerListProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, category) => ({ ...acc, [category]: true }), {}),
  )
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Memoize the toggle category function
  const toggleCategory = useCallback((category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }, [])

  // Memoize the filtered categories
  const filteredCategories = useMemo(() => {
    return filterCategory ? [filterCategory] : categories
  }, [filterCategory, categories])

  // Memoize filtered timers based on search query and category filter
  const filteredTimers = useMemo(() => {
    return timers.filter(
      (timer) =>
        (filterCategory ? timer.category === filterCategory : true) &&
        (searchQuery ? timer.name.toLowerCase().includes(searchQuery.toLowerCase()) : true),
    )
  }, [timers, filterCategory, searchQuery])

  // Memoize the grouped timers by category
  const timersByCategory = useMemo(() => {
    return filteredCategories.map((category) => ({
      category,
      timers: filteredTimers.filter((timer) => timer.category === category),
    }))
  }, [filteredCategories, filteredTimers])

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  // Handle category filter change
  const handleCategoryChange = useCallback((value: string) => {
    setFilterCategory(value === "all" ? null : value)
  }, [])

  // Handle category actions with useCallback
  const handleStartAll = useCallback((category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onStartAll(category)
  }, [onStartAll])

  const handlePauseAll = useCallback((category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onPauseAll(category)
  }, [onPauseAll])

  const handleResetAll = useCallback((category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onResetAll(category)
  }, [onResetAll])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full sm:w-1/2">
          <Label htmlFor="search-timer">Search Timers</Label>
          <Input
            id="search-timer"
            placeholder="Search by timer name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mt-1"
          />
        </div>
        <div className="w-full sm:w-1/2">
          <Label htmlFor="filter-category">Filter by Category</Label>
          <Select
            value={filterCategory || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="filter-category" className="mt-1">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {timersByCategory.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No timers found. Add a timer to get started.</p>
          </CardContent>
        </Card>
      ) : (
        timersByCategory.map(({ category, timers }) => (
          <Collapsible
            key={category}
            open={openCategories[category]}
            onOpenChange={() => toggleCategory(category)}
            className="space-y-2"
          >
            <Card>
              <CardHeader className="py-4 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{category}</CardTitle>
                    <CardDescription>
                      {timers.length} timer{timers.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleStartAll(category, e)}
                      >
                        Start All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handlePauseAll(category, e)}
                      >
                        Pause All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleResetAll(category, e)}
                      >
                        Reset All
                      </Button>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {openCategories[category] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="grid gap-4 p-6 pt-0">
                  {timers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No timers in this category</p>
                  ) : (
                    timers.map((timer) => (
                      <Timer
                        key={timer.id}
                        timer={timer}
                        onStart={() => onStart(timer.id)}
                        onPause={() => onPause(timer.id)}
                        onReset={() => onReset(timer.id)}
                      />
                    ))
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))
      )}
    </div>
  )
}
