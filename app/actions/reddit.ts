"use server";

import { fetchRecentPosts, type RedditPost } from "@/lib/reddit";
import { analyzePost } from "@/lib/gemini";

export async function getSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  try {
    const posts = await fetchRecentPosts(subreddit);
    
    // Analyze each post for categories
    const analyzedPosts = await Promise.all(
      posts.map(async (post) => {
        const analysis = await analyzePost(post);
        return {
          ...post,
          categories: analysis.categories
        };
      })
    );

    return analyzedPosts;
  } catch (error) {
    console.error(`Error fetching posts for r/${subreddit}:`, error);
    throw error;
  }
} 