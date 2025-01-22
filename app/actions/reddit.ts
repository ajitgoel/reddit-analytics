"use server";

import { subredditService } from '@/services/subreddit/subredditService';
import { getRedditClient } from '@/lib/reddit';
import { analyzePost } from '@/lib/ai';

export async function getSubredditPosts(subredditName: string) {
  try {
    // 1. Check Supabase for cached data
    const { needsRefresh, posts } = await subredditService.getSubredditData(subredditName);

    // If data is fresh, return cached data
    if (!needsRefresh && posts) {
      return posts;
    }

    // 2. If data is stale or doesn't exist, fetch new data
    const reddit = getRedditClient();
    const subreddit=await reddit.getSubreddit(subredditName);
    const newPosts = await subreddit.getTop({ time: 'day', limit: 100 });

    // 3. Analyze posts with AI
    const analyzedPosts = await Promise.all(
      newPosts.map(async (post) => {
        const analysis = await analyzePost(post);
        // Separate post data from categories
        const postData = {
          reddit_post_id: post.id,
          title: post.title,
          content: post.selftext,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: new Date(post.created_utc * 1000),
          url: post.url,
          analyzed_at: new Date(),
        };

        return {
          ...postData,
          categories: analysis.categories,
        };
      })
    );

    // 4. Update Supabase with new data
    await subredditService.updateSubredditData(
      subredditName,
      // Only pass the post data without categories
      analyzedPosts.map(({...postData }) => postData),
      // Pass categories separately
      analyzedPosts.flatMap(post => 
        post.categories.map(cat => ({
          post_id: post.reddit_post_id,
          category_id: cat.id,
          is_relevant: cat.is_relevant,
        }))
      )
    );

    return analyzedPosts;
  } catch (error) {
    console.error('Error in getSubredditPosts:', error);
    throw error;
  }
} 