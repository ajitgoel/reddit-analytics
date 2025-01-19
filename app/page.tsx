"use client";

import { useState } from "react";
import { SubredditCard } from "@/components/SubredditCard";
import { AddSubredditModal } from "@/components/AddSubredditModal";
import { defaultSubreddits, type Subreddit } from "@/lib/subreddits";

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>(defaultSubreddits);

  const handleAddSubreddit = async (subredditName: string) => {
    // Check if subreddit already exists
    if (subreddits.some((s) => s.name === subredditName)) {
      return;
    }

    // Fetch subreddit info
    const response = await fetch(
      `https://www.reddit.com/r/${subredditName}/about.json`
    );
    const data = await response.json();

    const newSubreddit: Subreddit = {
      name: subredditName,
      description: data.data.public_description || `r/${subredditName} community`,
      memberCount: data.data.subscribers,
    };

    setSubreddits((prev) => [...prev, newSubreddit]);
  };

  return (
    <main className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reddit Analytics Platform</h1>
        <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard
            key={subreddit.name}
            name={subreddit.name}
            description={subreddit.description}
            memberCount={subreddit.memberCount}
          />
        ))}
      </div>
    </main>
  );
}
