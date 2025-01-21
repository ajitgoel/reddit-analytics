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
  const subredditName = await params.subreddit;
  return {
    title: `r/${subredditName.toLowerCase()} Analytics`,
    description: `Analytics and insights for r/${subredditName.toLowerCase()}`,
  };
}

interface PageProps {
  params: {
    subreddit: string;
  };
}

const SubredditPage = async ({ params }: PageProps) => {
  const subredditName = await params.subreddit;
  console.log('Starting to load subreddit:', subredditName);

  try {
    // First check if the subreddit exists in our database
    console.log('Checking if subreddit exists in database...');
    const subredditExists = await subredditService.checkSubredditExists(subredditName);
    console.log('Subreddit exists in database:', subredditExists);
    
    if (!subredditExists) {
      console.log('Subreddit not found in database, showing 404');
      notFound();
    }

    // Get subreddit data
    console.log('Fetching subreddit data from database...');
    const { needsRefresh, posts } = await subredditService.getSubredditData(subredditName);
    console.log('Got subreddit data:', { needsRefresh, postCount: posts?.length });

    // If data is fresh, return cached data
    if (!needsRefresh && posts && posts.length > 0) {
      console.log('Using cached data, posts count:', posts.length);
      return <SubredditPageContent posts={posts} />;
    }

    // If data is stale or doesn't exist, fetch new data
    console.log('Fetching fresh data from Reddit API...');
    const reddit = getRedditClient();
    let newPosts;
    try {
      const subreddit = await reddit.getSubreddit(subredditName);
      newPosts = await subreddit.getTop({ time: "day", limit: 100 });
      console.log('Fetched posts from Reddit:', newPosts.length);
    } catch (redditError) {
      console.error('Error fetching from Reddit:', redditError);
      if (posts && posts.length > 0) {
        console.log('Using stale cached data after Reddit API error');
        return <SubredditPageContent posts={posts} />;
      }
      console.log('No cached data available, showing 404');
      notFound();
    }

    // Analyze posts with AI
    console.log('Starting AI analysis of posts...');
    const analyzedPosts = await Promise.all(
      newPosts.map(async (post) => {
        console.log('Analyzing post:', post.id);
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
    console.log('Completed AI analysis, analyzed posts:', analyzedPosts.length);

    // Update Supabase with new data
    console.log('Updating Supabase with new data...');
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
    console.log('Successfully updated Supabase');

    return <SubredditPageContent posts={analyzedPosts} />;
  } catch (error) {
    console.error("Error loading subreddit:", error);
    notFound();
  }
};

export default SubredditPage; 