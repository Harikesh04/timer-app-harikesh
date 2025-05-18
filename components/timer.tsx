"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Pause, Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/format-time"
import type { TimerType } from "@/types/timer"

interface TimerProps {
  timer: TimerType
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

/**
 * Timer component that displays and controls an individual timer
 * Shows time remaining, progress bar, and control buttons
 */
export function Timer({ timer, onStart, onPause, onReset }: TimerProps) {
  // Track the timer's remaining time in seconds
  const [remainingTime, setRemainingTime] = useState<number>(timer.remainingTime || timer.duration)
  // Calculate progress percentage for the progress bar
  const [progress, setProgress] = useState<number>(
    ((timer.duration - (timer.remainingTime || timer.duration)) / timer.duration) * 100,
  )
  // State to control showing the halfway alert animation
  const [showHalfwayAlert, setShowHalfwayAlert] = useState<boolean>(false)

  useEffect(() => {
    // Update remaining time based on timer state
    if (timer.status === "running" && timer.endTime) {
      const interval = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((timer.endTime! - now) / 1000))

        setRemainingTime(remaining)
        setProgress(((timer.duration - remaining) / timer.duration) * 100)

        // Check for halfway alert
        if (timer.halfwayAlert && remaining <= timer.duration / 2 && remaining > timer.duration / 2 - 2) {
          setShowHalfwayAlert(true)
          setTimeout(() => setShowHalfwayAlert(false), 3000)
        }

        if (remaining <= 0) {
          clearInterval(interval)
        }
      }, 100)

      return () => clearInterval(interval)
    } else {
      setRemainingTime(timer.remainingTime || timer.duration)
      setProgress(((timer.duration - (timer.remainingTime || timer.duration)) / timer.duration) * 100)
    }
  }, [timer])

  // Memoize the status color computation to prevent unnecessary recalculations
  const statusColor = useMemo(() => {
    if (timer.completed) return "text-green-500 dark:text-green-400"
    if (timer.status === "running") return "text-blue-500 dark:text-blue-400"
    return "text-slate-500 dark:text-slate-400"
  }, [timer.completed, timer.status])

  // Memoize the card class based on completion status
  const cardClass = useMemo(() => {
    return cn(
      "relative overflow-hidden transition-all duration-300",
      timer.completed ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30" : ""
    )
  }, [timer.completed])

  // Memoize the status text
  const statusText = useMemo(() => {
    if (timer.completed) return "Completed"
    return timer.status.charAt(0).toUpperCase() + timer.status.slice(1)
  }, [timer.completed, timer.status])

  // Memoize the status text class
  const statusTextClass = useMemo(() => {
    return cn(
      "text-xs font-medium",
      timer.completed
        ? "text-green-500"
        : timer.status === "running"
          ? "text-blue-500"
          : timer.status === "paused"
            ? "text-amber-500"
            : "text-slate-500"
    )
  }, [timer.completed, timer.status])

  // Handle start click with useCallback
  const handleStart = useCallback(() => {
    if (!timer.completed) {
      onStart()
    }
  }, [timer.completed, onStart])

  // Handle pause click with useCallback
  const handlePause = useCallback(() => {
    onPause()
  }, [onPause])

  // Handle reset click with useCallback
  const handleReset = useCallback(() => {
    if (!timer.completed) {
      onReset()
    }
  }, [timer.completed, onReset])

  return (
    <Card className={cardClass}>
      {showHalfwayAlert && (
        <div className="absolute inset-0 bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center z-10 animate-pulse">
          <div className="bg-background p-3 rounded-lg shadow-lg">
            <p className="font-medium">Halfway point reached!</p>
          </div>
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 flex-1">
            <h3 className="font-medium text-lg">{timer.name}</h3>
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-mono", statusColor)}>{formatTime(remainingTime)}</span>
              <span className="text-xs text-muted-foreground">/ {formatTime(timer.duration)}</span>
            </div>
            <div className="w-full mt-2">
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {timer.status === "running" ? (
              <Button size="sm" variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-1" /> Pause
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleStart} disabled={timer.completed}>
                <Play className="h-4 w-4 mr-1" /> Start
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleReset} disabled={timer.completed}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{timer.category}</span>
          <span className={statusTextClass}>
            {statusText}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
