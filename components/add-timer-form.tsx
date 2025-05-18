"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { Timer } from "@/types/timer" // Import Timer type

interface AddTimerFormProps {
  onAddTimer: (timer: Omit<Timer, "id" | "status" | "completed" | "endTime" | "remainingTime">) => void
  categories: string[]
}

export function AddTimerForm({ onAddTimer, categories }: AddTimerFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [halfwayAlert, setHalfwayAlert] = useState(false)

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a timer name",
        variant: "destructive",
      })
      return
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid duration in seconds",
        variant: "destructive",
      })
      return
    }

    const selectedCategory = showNewCategory ? newCategory : category

    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select or create a category",
        variant: "destructive",
      })
      return
    }

    onAddTimer({
      name,
      duration: Number(duration),
      category: selectedCategory,
      halfwayAlert,
    })

    // Reset form
    setName("")
    setDuration("")
    setCategory("")
    setNewCategory("")
    setShowNewCategory(false)
    setHalfwayAlert(false)

    toast({
      title: "Success",
      description: "Timer added successfully",
    })
  }, [name, duration, showNewCategory, newCategory, category, halfwayAlert, onAddTimer, toast])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Timer</CardTitle>
        <CardDescription>Create a new timer with custom duration and category</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Timer Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Workout"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g., 300 (5 minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="category">Category</Label>
              <div className="flex items-center space-x-2">
                <Switch id="new-category" checked={showNewCategory} onCheckedChange={setShowNewCategory} />
                <Label htmlFor="new-category" className="text-sm">
                  Create new category
                </Label>
              </div>
            </div>

            {showNewCategory ? (
              <Input
                id="new-category-input"
                placeholder="Enter new category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="halfway-alert" checked={halfwayAlert} onCheckedChange={setHalfwayAlert} />
            <Label htmlFor="halfway-alert">Enable halfway alert</Label>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Add Timer
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
