"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { TimerList } from "@/components/timer-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTimers } from "@/hooks/use-timers"
import { CompletionModal } from "@/components/completion-modal"
import { Button } from "@/components/ui/button"
import { Plus, History } from "lucide-react"
import { AddTimerDialog } from "@/components/add-timer-dialog"
import type { Timer } from "@/types/timer"

/**
 * Main application component that renders the timer dashboard
 * Manages the timer display, controls, and UI interactions
 */

export function TimerDashboard() {
  const {
    timers,
    categories,
    addTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    completeTimer,
    startAllInCategory,
    pauseAllInCategory,
    resetAllInCategory,
  } = useTimers()

  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isAddTimerOpen, setIsAddTimerOpen] = useState(false)

  // Handle opening and closing the add timer dialog
  const handleOpenAddTimer = useCallback(() => {
    setIsAddTimerOpen(true)
  }, [])

  const handleCloseCompletionModal = useCallback(() => {
    setCompletedTimer(null)
  }, [])

  // Listen for timer completions
  useEffect(() => {
    const checkCompletions = () => {
      const now = Date.now()
      timers.forEach((timer) => {
        if (timer.status === "running" && timer.endTime && timer.endTime <= now && !timer.completed) {
          completeTimer(timer.id)
          setCompletedTimer(timer)
        }
      })
    }

    const interval = setInterval(checkCompletions, 1000)
    return () => clearInterval(interval)
  }, [timers, completeTimer])

  const headerSection = useMemo(() => (
    <header className="flex justify-between items-center mb-8 pt-4">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Timer Dashboard</h1>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={handleOpenAddTimer}>
          <Plus className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Add Timer</span>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link href="/history">
            <History className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">History</span>
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  ), [handleOpenAddTimer])

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {headerSection}

      <TimerList
        timers={timers}
        categories={categories}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer}
        onStartAll={startAllInCategory}
        onPauseAll={pauseAllInCategory}
        onResetAll={resetAllInCategory}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <AddTimerDialog
        open={isAddTimerOpen}
        onOpenChange={setIsAddTimerOpen}
        onAddTimer={addTimer}
        categories={categories}
      />

      {completedTimer && <CompletionModal timer={completedTimer} onClose={handleCloseCompletionModal} />}
    </div>
  )
}
