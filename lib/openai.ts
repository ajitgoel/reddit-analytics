import OpenAI from "openai";
import { RedditPost } from "./reddit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Theme {
  id: string;
  name: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral";
  keywords: string[];
  postCount: number;
  posts: {
    title: string;
    url: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
}

const SYSTEM_PROMPT = `You are a Reddit post analyzer. Your task is to:
1. Identify common themes across posts
2. Analyze sentiment for each post and theme
3. Extract key discussion points and keywords

For each theme, provide:
- A clear, concise name
- A brief description of what the theme represents
- Overall sentiment (positive/negative/neutral)
- Key discussion points or keywords
- List of posts that belong to this theme

Group posts that share similar topics, concerns, or discussion patterns.`;

export async function analyzeRedditPosts(posts: RedditPost[]): Promise<Theme[]> {
  try {
    const postsForAnalysis = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: SYSTEM_PROMPT 
        },
        { 
          role: "user", 
          content: `Analyze these Reddit posts and identify themes:\n${JSON.stringify(postsForAnalysis, null, 2)}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return analysis.themes.map((theme: any, index: number) => ({
      id: `theme-${index + 1}`,
      name: theme.name,
      description: theme.description,
      sentiment: theme.sentiment,
      keywords: theme.keywords,
      postCount: theme.posts.length,
      posts: theme.posts.map((postId: string) => {
        const post = posts.find(p => p.id === postId);
        return {
          title: post?.title || "",
          url: post?.url || "",
          sentiment: theme.postSentiments?.[postId] || "neutral"
        };
      })
    }));
  } catch (error) {
    console.error("Error analyzing posts:", error);
    throw new Error("Failed to analyze posts");
  }
} 