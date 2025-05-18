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

export type TimerType = Timer
