"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: string) => void
}

export function AddSubredditModal({ onAddSubreddit }: AddSubredditModalProps) {
  const [subredditInput, setSubredditInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const subredditName = subredditInput
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?reddit\.com\/r\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    try {
      const response = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`)

      if (!response.ok) {
        throw new Error("Subreddit not found")
      }

      await response.json()

      onAddSubreddit(subredditName)
      setSubredditInput("")
      setIsOpen(false)
    } catch {
      setError("Please enter a valid subreddit name or URL")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-none"
        >
          <PlusCircle className="h-4 w-4" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Add New Subreddit
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a subreddit name or URL to add it to your analytics dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subreddit" className="text-gray-300">
              Subreddit
            </Label>
            <Input
              id="subreddit"
              placeholder="r/subreddit or full Reddit URL"
              value={subredditInput}
              onChange={(e) => setSubredditInput(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                "hover:from-purple-600 hover:to-pink-600",
                "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Subreddit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

