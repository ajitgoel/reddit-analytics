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
import { PlusCircle } from "lucide-react";

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: string) => void;
}

export function AddSubredditModal({ onAddSubreddit }: AddSubredditModalProps) {
  const [subredditInput, setSubredditInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Extract subreddit name from input (handle both URL and direct name)
    const subredditName = subredditInput
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?reddit\.com\/r\//, "")
      .replace(/\/$/, "")
      .split("/")[0];

    try {
      // Validate subreddit exists
      const response = await fetch(
        `https://www.reddit.com/r/${subredditName}/about.json`
      );

      if (!response.ok) {
        throw new Error("Subreddit not found");
      }

      const data = await response.json();
      
      onAddSubreddit(subredditName);
      setSubredditInput("");
      setIsOpen(false);
    } catch (err) {
      setError("Please enter a valid subreddit name or URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
          <DialogDescription>
            Enter a subreddit name or URL to add it to your analytics dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subreddit">Subreddit</Label>
              <Input
                id="subreddit"
                placeholder="r/subreddit or full Reddit URL"
                value={subredditInput}
                onChange={(e) => setSubredditInput(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Subreddit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 