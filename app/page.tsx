import { SubredditCard } from "@/components/SubredditCard"
import { AddSubredditDialog } from "@/components/AddSubredditDialog"
import { subredditService } from "@/services/subreddit/subredditService"

export default async function Home() {
  // Fetch subreddits from Supabase
  const subreddits = await subredditService.getAllSubreddits();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-5xl font-extrabold mb-6 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Reddit Analytics Platform
          </h1>
          <AddSubredditDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subreddits.map((subreddit) => (
            <SubredditCard
              key={subreddit.name}
              name={subreddit.name}
              description={subreddit.description || `r/${subreddit.name} community`}
              memberCount={subreddit.member_count || 0}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

