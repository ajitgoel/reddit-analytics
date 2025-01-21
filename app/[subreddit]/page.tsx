import { subredditService } from "@/services/subreddit/subredditService";
import { getRedditClient } from "@/lib/reddit";
import { analyzePost } from "@/lib/ai";
import { notFound } from "next/navigation";
import { SubredditPageContent } from "./SubredditPageContent";
import { Metadata } from 'next';

interface PageProps {
  params: { subreddit: string };
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  return {
    title: `r/${params.subreddit.toLowerCase()} Analytics`,
    description: `Analytics and insights for r/${params.subreddit.toLowerCase()}`,
  };
}

export default async function SubredditPage(
  { params }: PageProps
) {
  const subredditName = params.subreddit.toLowerCase();

  try {
    // Get subreddit data
    const { needsRefresh, posts } = await subredditService.getSubredditData(
      subredditName
    );

    // If data is fresh, return cached data with categories
    if (!needsRefresh && posts) {
      return <SubredditPageContent posts={posts} />;
    }

    // If data is stale or doesn't exist, fetch new data
    const reddit = getRedditClient();
    let newPosts;
    try {
      const subreddit = await reddit.getSubreddit(subredditName);
      newPosts = await subreddit.getTop({ time: "day", limit: 100 });
    } catch (redditError) {
      console.error('Error fetching from Reddit:', redditError);
      // If we have cached posts, show them even if stale
      if (posts) {
        return <SubredditPageContent posts={posts} />;
      }
      throw redditError;
    }

    // Analyze posts with AI
    const analyzedPosts = await Promise.all(
      newPosts.map(async (post) => {
        const analysis = await analyzePost(post);
        return {
          reddit_post_id: post.id,
          title: post.title,
          content: post.selftext,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: new Date(post.created_utc * 1000),
          url: post.url,
          analyzed_at: new Date(),
          post_categories: analysis.categories.map(cat => ({
            category_id: cat.id,
            is_relevant: cat.is_relevant
          }))
        };
      })
    );

    // Update Supabase with new data
    await subredditService.updateSubredditData(
      subredditName,
      analyzedPosts,
      analyzedPosts.flatMap((post) =>
        post.post_categories.map((cat) => ({
          post_id: post.reddit_post_id,
          category_id: cat.category_id,
          is_relevant: cat.is_relevant,
        }))
      )
    );

    return <SubredditPageContent posts={analyzedPosts} />;
  } catch (error) {
    console.error("Error loading subreddit:", error);
    if (error instanceof Error && error.message.includes('not found')) {
      notFound();
    }
    throw error;
  }
} 