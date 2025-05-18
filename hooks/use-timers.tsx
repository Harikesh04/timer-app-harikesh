"use client"

import { isBrowser } from "@/lib/utils"
import { useState, useEffect, useCallback, useRef } from "react"
import { v4 as uuidv4 } from "uuid"

/**
 * Timer interface representing an active timer in the application
 */
export interface Timer {
  id: string              // Unique identifier
  name: string            // Display name
  duration: number        // Total duration in seconds
  category: string        // Category for grouping
  status: "idle" | "running" | "paused"  // Current status
  completed: boolean      // Whether timer has completed
  endTime?: number        // Unix timestamp when timer will end (if running)
  remainingTime: number   // Time remaining in seconds
  halfwayAlert?: boolean  // Whether to show alert at halfway point
}

/**
 * CompletedTimer interface representing a timer in history
 */
export interface CompletedTimer {
  id: string              // Unique identifier
  name: string            // Display name
  duration: number        // Total duration in seconds
  category: string        // Category for grouping
  completedAt: Date       // When the timer was completed
}

// Storage keys
const STORAGE_KEYS = {
  TIMERS: "timer-app-timers",
  COMPLETED_TIMERS: "timer-app-completed-timers",
  CATEGORIES: "timer-app-categories"
}

// Type guard for Timer
const isTimerArray = (data: unknown): data is Timer[] => {
  return Array.isArray(data) && data.every(
    (item) => 
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.duration === "number" &&
      typeof item.category === "string" &&
      ["idle", "running", "paused"].includes(item.status) &&
      typeof item.completed === "boolean"
  )
}

// Type guard for CompletedTimer
const isCompletedTimerArray = (data: unknown): data is CompletedTimer[] => {
  return Array.isArray(data) && data.every(
    (item) => 
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.duration === "number" &&
      typeof item.category === "string" &&
      item.completedAt instanceof Date && !isNaN(item.completedAt.getTime())
  )
}

/**
 * Custom hook that manages timer state and operations
 * Handles timer creation, control, persistence, and history tracking
 */
export function useTimers() {
  // Default categories for organizing timers
  const DEFAULT_CATEGORIES = ["Work", "Study", "Exercise", "Meditation", "Break"]
  
  // State for timer data
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [timers, setTimers] = useState<Timer[]>([])
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([])
  const isInitialized = useRef(false)

  // Load data from localStorage on initial component mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    try {
      if (!isBrowser()) return;
      
      const savedTimers = localStorage.getItem(STORAGE_KEYS.TIMERS)
      const savedCompletedTimers = localStorage.getItem(STORAGE_KEYS.COMPLETED_TIMERS)
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)

      if (savedTimers) {
        try {
          const parsed = JSON.parse(savedTimers)
          if (isTimerArray(parsed)) {
            // Recalculate endTime for running timers and ensure remainingTime property exists
            const updatedTimers = parsed.map(timer => {
              if (timer.status === "running" && timer.endTime) {
                const now = Date.now()
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
              return { ...timer, remainingTime: timer.remainingTime ?? timer.duration }
            })
            
            setTimers(updatedTimers)
          } else {
            console.error('Invalid timer data format');
          }
        } catch (e) {
          console.error('Error parsing saved timers:', e);
        }
      }

      if (savedCompletedTimers) {
        try {
          const parsed = JSON.parse(savedCompletedTimers)
          const parsedCompletedTimers = parsed
            .map((timer: any) => {
              const completedAt = new Date(timer.completedAt)
              if (isNaN(completedAt.getTime())) return null
              return {
                ...timer,
                completedAt,
              }
            })
            .filter((timer: any): timer is CompletedTimer => timer !== null)
          
          if (isCompletedTimerArray(parsedCompletedTimers)) {
            setCompletedTimers(parsedCompletedTimers)
          } else {
            console.error('Invalid completed timer data format');
          }
        } catch (e) {
          console.error('Error parsing saved completed timers:', e);
        }
      }

      if (savedCategories) {
        try {
          const parsedCategories = JSON.parse(savedCategories)
          if (Array.isArray(parsedCategories) && parsedCategories.every(c => typeof c === "string")) {
            setCategories(parsedCategories.length > 0 ? parsedCategories : DEFAULT_CATEGORIES)
          } else {
            console.error('Invalid categories data format');
          }
        } catch (e) {
          console.error('Error parsing saved categories:', e);
        }
      }
      
      isInitialized.current = true;
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Save data to localStorage using memoized functions
  // Save timers to localStorage
  const saveTimers = useCallback((data: Timer[]) => {
    try {
      if (!isBrowser()) return;
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS.TIMERS, serializedData);
    } catch (error) {
      console.error("Error saving timers to localStorage:", error)
    }
  }, [])

  // Save completed timers history to localStorage
  const saveCompletedTimers = useCallback((data: CompletedTimer[]) => {
    try {
      if (!isBrowser()) return;
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TIMERS, serializedData);
    } catch (error) {
      console.error("Error saving completed timers to localStorage:", error)
    }
  }, [])

  // Save categories to localStorage
  const saveCategories = useCallback((data: string[]) => {
    try {
      if (!isBrowser()) return;
      
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, serializedData);
    } catch (error) {
      console.error("Error saving categories to localStorage:", error)
    }
  }, [])

  // Save categories to localStorage when they change
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
      remainingTime: newTimer.duration, // Initialize remainingTime
    }

    setTimers((prev) => {
      const updatedTimers = [...prev, timer];
      saveTimers(updatedTimers);
      return updatedTimers;
    })

    // Add category if it's new
    if (!categories.includes(newTimer.category)) {
      setCategories((prev) => [...prev, newTimer.category])
    }
  }, [categories, saveTimers])

  const startTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const updatedTimers = prev.map((timer) => {
        if (timer.id === id && !timer.completed) {
          const now = Date.now()
          const remaining = timer.remainingTime
          return {
            ...timer,
            status: "running" as const,
            endTime: now + remaining * 1000,
          }
        }
        return timer
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    })
  }, [saveTimers])

  const pauseTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const updatedTimers = prev.map((timer) => {
        if (timer.id === id && timer.status === "running") {
          const now = Date.now()
          const remaining = timer.endTime
            ? Math.max(0, Math.floor((timer.endTime - now) / 1000))
            : timer.remainingTime
          return {
            ...timer,
            status: "paused" as const,
            remainingTime: remaining,
            endTime: undefined,
          }
        }
        return timer
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    })
  }, [saveTimers])

  const resetTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const updatedTimers = prev.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            status: "idle" as const,
            completed: false,
            remainingTime: timer.duration,
            endTime: undefined,
          }
        }
        return timer
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    })
  }, [saveTimers])

  const completeTimer = useCallback((id: string) => {
    // First find the timer to complete
    const timerToComplete = timers.find(timer => timer.id === id);
    
    // If the timer exists, add it to completed timers
    if (timerToComplete) {
      const completedTimer: CompletedTimer = {
        id: timerToComplete.id,
        name: timerToComplete.name,
        duration: timerToComplete.duration,
        category: timerToComplete.category,
        completedAt: new Date(),
      };
      
      // Update completed timers separately
      setCompletedTimers(prev => {
        const updatedCompletedTimers = [...prev, completedTimer];
        saveCompletedTimers(updatedCompletedTimers);
        return updatedCompletedTimers;
      });
    }
    
    // Update the timer status
    setTimers(prev => {
      const updatedTimers = prev.map(timer => {
        if (timer.id === id) {
          return {
            ...timer,
            status: "idle" as const,
            completed: true,
            remainingTime: 0,
            endTime: undefined,
          };
        }
        return timer;
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    });
  }, [timers, saveTimers, saveCompletedTimers]);

  const startAllInCategory = useCallback((category: string) => {
    setTimers((prev) => {
      const updatedTimers = prev.map((timer) => {
        if (timer.category === category && !timer.completed) {
          const now = Date.now()
          const remaining = timer.remainingTime
          return {
            ...timer,
            status: "running" as const,
            endTime: now + remaining * 1000,
          }
        }
        return timer
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    })
  }, [saveTimers])

  const pauseAllInCategory = useCallback((category: string) => {
    setTimers((prev) => {
      const updatedTimers = prev.map((timer) => {
        if (timer.category === category && timer.status === "running") {
          const now = Date.now()
          const remaining = timer.endTime
            ? Math.max(0, Math.floor((timer.endTime - now) / 1000))
            : timer.remainingTime
          return {
            ...timer,
            status: "paused" as const,
            remainingTime: remaining,
            endTime: undefined,
          }
        }
        return timer
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    })
  }, [saveTimers])

  const resetAllInCategory = useCallback((category: string) => {
    setTimers((prev) => {
      const updatedTimers = prev.map((timer) => {
        if (timer.category === category) {
          return {
            ...timer,
            status: "idle" as const,
            completed: false,
            remainingTime: timer.duration,
            endTime: undefined,
          }
        }
        return timer
      });
      saveTimers(updatedTimers);
      return updatedTimers;
    })
  }, [saveTimers])

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