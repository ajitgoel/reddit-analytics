"use server";

import { analyzeRedditPosts } from "@/lib/gemini";
import { getSubredditPosts } from "./reddit";

export async function getSubredditThemes(subreddit: string) {
  try {
    console.log(`Starting theme analysis for r/${subreddit}`);
    
    // Fetch recent posts
    const posts = await getSubredditPosts(subreddit);
    console.log(`Retrieved ${posts.length} posts for analysis`);
    
    // Only analyze if we have posts
    if (posts.length === 0) {
      console.log("No posts found for analysis");
      return [];
    }

    console.log(`Analyzing ${posts.length} posts for r/${subreddit}`);
    console.log('Sample post:', posts[0]); // Log first post for debugging
    
    // Analyze posts to identify themes
    const themes = await analyzeRedditPosts(posts);
    
    console.log(`Analysis complete. Found ${themes.length} themes:`, 
      themes.map(t => t.name));
    
    return themes;
  } catch (error) {
    console.error(`Error analyzing themes for r/${subreddit}:`, error);
    // Rethrow with more context
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Failed to analyze subreddit themes"
    );
  }
} 