"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Search } from "lucide-react"
import { formatTime } from "@/lib/format-time"
import { CompletedTimer } from "@/hooks/use-timers"

interface TimerHistoryProps {
  completedTimers: CompletedTimer[]
  onExport: () => void
}

export function TimerHistory({ completedTimers, onExport }: TimerHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredTimers = useMemo(() => completedTimers.filter(
    (timer) =>
      timer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timer.category.toLowerCase().includes(searchQuery.toLowerCase()),
  ), [completedTimers, searchQuery])

  // Sort by completion time (most recent first)
  const sortedTimers = useMemo(() => [...filteredTimers].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()), [filteredTimers])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Timer History</CardTitle>
            <CardDescription>View and export your completed timers</CardDescription>
          </div>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
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
  )
}
