"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import confetti from "canvas-confetti"
import type { Timer } from "@/types/timer" // Declare the Timer variable

interface CompletionModalProps {
  timer: Timer
  onClose: () => void
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formattedMinutes = String(minutes).padStart(2, "0")
  const formattedSeconds = String(remainingSeconds).padStart(2, "0")
  return `${formattedMinutes}:${formattedSeconds}`
}

export function CompletionModal({ timer, onClose }: CompletionModalProps) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (open) {
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [open])

  const handleClose = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <DialogTitle className="text-center text-xl mt-4">Timer Completed!</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations! You've completed your "{timer.name}" timer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-center text-muted-foreground">
            <p>Category: {timer.category}</p>
            <p>Duration: {formatTime(timer.duration)}</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
