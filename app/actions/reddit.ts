"use server";

import { fetchRecentPosts, type RedditPost } from "@/lib/reddit";

export async function getSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  try {
    const posts = await fetchRecentPosts(subreddit);
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for r/${subreddit}:`, error);
    throw error;
  }
} 