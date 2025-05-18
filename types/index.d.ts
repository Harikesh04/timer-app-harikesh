interface Timer {
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

interface CompletedTimer {
  id: string
  name: string
  duration: number
  category: string
  completedAt: Date
}
