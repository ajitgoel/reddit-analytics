import { notFound } from "next/navigation";
import { defaultSubreddits } from "@/lib/subreddits";
import { use } from "react";

interface SubredditLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    subreddit: string;
  }>;
}

export default function SubredditLayout({
  children,
  params,
}: SubredditLayoutProps) {
  const { subreddit } = use(params);
  
  // Check if subreddit exists in our list
  const subredditExists = defaultSubreddits.some(
    (s) => s.name.toLowerCase() === subreddit.toLowerCase()
  );

  if (!subredditExists) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">r/{subreddit}</h1>
        <p className="text-muted-foreground">
          Analytics and insights for r/{subreddit}
        </p>
      </div>
      {children}
    </div>
  );
} 