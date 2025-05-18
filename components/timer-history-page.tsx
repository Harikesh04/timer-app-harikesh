"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Search, ArrowLeft } from "lucide-react"
import { formatTime } from "@/lib/format-time"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTimers } from "@/hooks/use-timers"

export function TimerHistoryPage() {
  const { completedTimers, exportTimerData } = useTimers()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTimers = useMemo(() => completedTimers.filter(
    (timer) =>
      timer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timer.category.toLowerCase().includes(searchQuery.toLowerCase()),
  ), [completedTimers, searchQuery])

  const sortedTimers = useMemo(() => [...filteredTimers].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()), [filteredTimers])

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Back to Timers</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Timer History</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportTimerData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Completed Timers</CardTitle>
          <CardDescription>View your completed timer history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="search-history" className="sr-only">
              Search History
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-history"
                placeholder="Search by name or category..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {sortedTimers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {completedTimers.length === 0
                ? "No completed timers yet. Start a timer to see history."
                : "No results found. Try a different search term."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Completed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTimers.map((timer) => (
                    <TableRow key={`${timer.id}-${timer.completedAt.getTime()}`}>
                      <TableCell className="font-medium">{timer.name}</TableCell>
                      <TableCell>{timer.category}</TableCell>
                      <TableCell>{formatTime(timer.duration)}</TableCell>
                      <TableCell>{timer.completedAt.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
