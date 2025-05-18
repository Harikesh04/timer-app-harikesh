"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { v4 as uuidv4 } from "uuid"

export interface Timer {
  id: string
  name: string
  duration: number
  category: string
  status: "idle" | "running" | "paused"
  completed: boolean
  endTime?: number
  remainingTime?: number
  halfwayAlert?: boolean
}

export interface CompletedTimer {
  id: string
  name: string
  duration: number
  category: string
  completedAt: Date
}

// Storage keys
const STORAGE_KEYS = {
  TIMERS: "timer-app-timers",
  COMPLETED_TIMERS: "timer-app-completed-timers",
  CATEGORIES: "timer-app-categories"
}

export function useTimers() {
  const DEFAULT_CATEGORIES = ["Work", "Study", "Exercise", "Meditation", "Break"]
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [timers, setTimers] = useState<Timer[]>([])
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([])
  const isInitialized = useRef(false)

  // Load data from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    try {
      if (typeof window === 'undefined') return;
      
      console.log('Loading timer data from localStorage...');
      
      const savedTimers = localStorage.getItem(STORAGE_KEYS.TIMERS)
      const savedCompletedTimers = localStorage.getItem(STORAGE_KEYS.COMPLETED_TIMERS)
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
      
      console.log('Found saved timers:', !!savedTimers);
      console.log('Found saved completed timers:', !!savedCompletedTimers);
      console.log('Found saved categories:', !!savedCategories);

      if (savedTimers) {
        try {
          const parsedTimers = JSON.parse(savedTimers) as Timer[]
          console.log(`Loaded ${parsedTimers.length} timers from localStorage`);
          
          // Recalculate endTime for running timers to ensure they continue correctly after refresh
          const updatedTimers = parsedTimers.map(timer => {
            if (timer.status === "running" && timer.endTime) {
              const now = Date.now()
              // If timer endTime is in the past (would have completed during refresh), mark as completed
              if (timer.endTime <= now) {
                return {
                  ...timer,
                  status: "idle" as const,
                  completed: true,
                  remainingTime: 0,
                  endTime: undefined
                }
              }
            }
            return timer
          })
          
          setTimers(updatedTimers)
        } catch (e) {
          console.error('Error parsing saved timers:', e);
        }
      }

      if (savedCompletedTimers) {
        try {
          // Convert string dates back to Date objects
          const parsedCompletedTimers = JSON.parse(savedCompletedTimers).map((timer: any) => ({
            ...timer,
            completedAt: new Date(timer.completedAt),
          }))
          console.log(`Loaded ${parsedCompletedTimers.length} completed timers from localStorage`);
          setCompletedTimers(parsedCompletedTimers)
        } catch (e) {
          console.error('Error parsing saved completed timers:', e);
        }
      }

      if (savedCategories) {
        try {
          const parsedCategories = JSON.parse(savedCategories) as string[]
          console.log(`Loaded ${parsedCategories.length} categories from localStorage`);
          setCategories(parsedCategories.length > 0 ? parsedCategories : DEFAULT_CATEGORIES)
        } catch (e) {
          console.error('Error parsing saved categories:', e);
        }
      }
      
      isInitialized.current = true;
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Save data to localStorage whenever it changes using memoized functions
  const saveTimers = useCallback((data: Timer[]) => {
    try {
      if (typeof window === 'undefined') return;
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS.TIMERS, serializedData);
      console.log(`Saved ${data.length} timers to localStorage`);
    } catch (error) {
      console.error("Error saving timers to localStorage:", error)
    }
  }, [])

  const saveCompletedTimers = useCallback((data: CompletedTimer[]) => {
    try {
      if (typeof window === 'undefined') return;
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TIMERS, serializedData);
      console.log(`Saved ${data.length} completed timers to localStorage`);
    } catch (error) {
      console.error("Error saving completed timers to localStorage:", error)
    }
  }, [])

  const saveCategories = useCallback((data: string[]) => {
    try {
      if (typeof window === 'undefined') return;
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, serializedData);
      console.log(`Saved ${data.length} categories to localStorage`);
    } catch (error) {
      console.error("Error saving categories to localStorage:", error)
    }
  }, [])

  useEffect(() => {
    if (!isInitialized.current) return;
    saveTimers(timers)
  }, [timers, saveTimers])

  useEffect(() => {
    if (!isInitialized.current) return;
    saveCompletedTimers(completedTimers)
  }, [completedTimers, saveCompletedTimers])

  useEffect(() => {
    if (!isInitialized.current) return;
    saveCategories(categories)
  }, [categories, saveCategories])

  const addTimer = useCallback((newTimer: Omit<Timer, "id" | "status" | "completed" | "endTime" | "remainingTime">) => {
    const timer: Timer = {
      id: uuidv4(),
      ...newTimer,
      status: "idle",
      completed: false,
    }

    setTimers((prev) => [...prev, timer])

    // Add category if it's new
    if (!categories.includes(newTimer.category)) {
      setCategories((prev) => [...prev, newTimer.category])
    }

    localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify([...timers, timer]))
  }, [categories])

  const startTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id && !timer.completed) {
          const now = Date.now()
          const remaining = timer.remainingTime || timer.duration
          return {
            ...timer,
            status: "running",
            endTime: now + remaining * 1000,
          }
        }
        return timer
      }),
    )
  }, [])

  const pauseTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id && timer.status === "running") {
          const now = Date.now()
          const remaining = timer.endTime
            ? Math.max(0, Math.floor((timer.endTime - now) / 1000))
            : timer.remainingTime || timer.duration
          return {
            ...timer,
            status: "paused",
            remainingTime: remaining,
            endTime: undefined,
          }
        }
        return timer
      }),
    )
  }, [])

  const resetTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            status: "idle",
            completed: false,
            remainingTime: timer.duration,
            endTime: undefined,
          }
        }
        return timer
      }),
    )
  }, [])

  const completeTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          // Add to completed timers
          const completedTimer: CompletedTimer = {
            id: timer.id,
            name: timer.name,
            duration: timer.duration,
            category: timer.category,
            completedAt: new Date(),
          }
          setCompletedTimers((prev) => [...prev, completedTimer])

          return {
            ...timer,
            status: "idle",
            completed: true,
            remainingTime: 0,
            endTime: undefined,
          }
        }
        return timer
      }),
    )
  }, [])

  const startAllInCategory = useCallback((category: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.category === category && !timer.completed) {
          const now = Date.now()
          const remaining = timer.remainingTime || timer.duration
          return {
            ...timer,
            status: "running",
            endTime: now + remaining * 1000,
          }
        }
        return timer
      }),
    )
  }, [])

  const pauseAllInCategory = useCallback((category: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.category === category && timer.status === "running") {
          const now = Date.now()
          const remaining = timer.endTime
            ? Math.max(0, Math.floor((timer.endTime - now) / 1000))
            : timer.remainingTime || timer.duration
          return {
            ...timer,
            status: "paused",
            remainingTime: remaining,
            endTime: undefined,
          }
        }
        return timer
      }),
    )
  }, [])

  const resetAllInCategory = useCallback((category: string) => {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.category === category) {
          return {
            ...timer,
            status: "idle",
            completed: false,
            remainingTime: timer.duration,
            endTime: undefined,
          }
        }
        return timer
      }),
    )
  }, [])

  const exportTimerData = useCallback(() => {
    try {
      const data = {
        timers,
        completedTimers,
        categories,
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `timer-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting timer data:", error)
    }
  }, [timers, completedTimers, categories])

  return {
    timers,
    categories,
    completedTimers,
    addTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    completeTimer,
    startAllInCategory,
    pauseAllInCategory,
    resetAllInCategory,
    exportTimerData,
  }
}
