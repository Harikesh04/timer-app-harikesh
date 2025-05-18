"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { Timer } from "@/types/timer"

interface AddTimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTimer: (timer: Omit<Timer, "id" | "status" | "completed" | "endTime" | "remainingTime">) => void
  categories: string[]
}

export function AddTimerDialog({ open, onOpenChange, onAddTimer, categories }: AddTimerDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [halfwayAlert, setHalfwayAlert] = useState(false)

  const resetForm = () => {
    setName("")
    setDuration("")
    setCategory("")
    setNewCategory("")
    setShowNewCategory(false)
    setHalfwayAlert(false)
  }

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
        description: "Please enter a valid duration in minutes",
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

    // Convert minutes to seconds for storage
    const durationInSeconds = Number(duration) * 60

    onAddTimer({
      name,
      duration: durationInSeconds,
      category: selectedCategory,
      halfwayAlert,
    })

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)

    toast({
      title: "Success",
      description: "Timer added successfully",
    })
  }, [name, duration, showNewCategory, newCategory, category, halfwayAlert, onAddTimer, resetForm, onOpenChange, toast])

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Timer</DialogTitle>
          <DialogDescription>Create a new timer with custom duration and category</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Timer Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Workout"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="category">Category</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="new-category" checked={showNewCategory} onCheckedChange={setShowNewCategory} />
                  <Label htmlFor="new-category" className="text-sm">
                    Create new
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
          </div>
          <DialogFooter>
            <Button type="submit">Add Timer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
