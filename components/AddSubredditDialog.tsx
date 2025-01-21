"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddSubredditDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [subredditName, setSubredditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Extract subreddit name and clean it
      const cleanName = subredditName
        .toLowerCase()
        .trim()
        .replace(/^(https?:\/\/)?(www\.)?reddit\.com\/r\//, "")
        .replace(/\/$/, "")
        .split("/")[0];

      // First check if the subreddit exists on Reddit
      const redditResponse = await fetch(
        `https://www.reddit.com/r/${cleanName}/about.json`
      );

      if (!redditResponse.ok) {
        throw new Error("Subreddit not found on Reddit");
      }

      // Add to our database
      const response = await fetch("/api/subreddits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: cleanName
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add subreddit");
      }

      setIsOpen(false);
      setSubredditName("");
      router.refresh(); // Refresh the page to show the new subreddit
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subreddit");
    } finally {
      setIsLoading(false);
    }
  };

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
            <Label htmlFor="name" className="text-gray-300">
              Subreddit
            </Label>
            <Input
              id="name"
              value={subredditName}
              onChange={(e) => setSubredditName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
              placeholder="r/subreddit or full Reddit URL"
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
                "disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
} 