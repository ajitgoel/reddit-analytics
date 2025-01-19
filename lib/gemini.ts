import { GoogleGenerativeAI } from "@google/generative-ai";
import { RedditPost } from "./reddit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_FLASH_API_KEY!);

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

const ANALYSIS_PROMPT = `
Analyze these Reddit posts and categorize them into themes. Return a JSON object with the following structure:

{
  "themes": [
    {
      "name": "Solution Requests",
      "description": "Posts where users are seeking solutions to problems",
      "sentiment": "neutral",
      "keywords": ["help", "solution", "problem", "fix", "how to"],
      "posts": ["post-id-1"],
      "postSentiments": {
        "post-id-1": "neutral"
      }
    }
  ]
}

Important rules:
1. Theme names must be one of: "Solution Requests", "Pain & Anger", "Advice Requests", "Money Talk"
2. Sentiment must be exactly: "positive", "negative", or "neutral"
3. Include maximum 5 keywords per theme
4. Only include themes that have at least one matching post
5. Each post can belong to multiple themes
6. Response must be valid JSON

Analyze the posts and categorize them based on their content and sentiment.`;

export async function analyzeRedditPosts(posts: RedditPost[]): Promise<Theme[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const postsForAnalysis = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content || "",
    }));

    if (postsForAnalysis.length === 0) {
      return [];
    }

    // Format the input data
    const inputData = JSON.stringify(postsForAnalysis, null, 2);
    console.log("Analyzing posts:", inputData);

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ 
          text: `${ANALYSIS_PROMPT}\n\nPosts to analyze:\n${inputData}\n\nRespond with only the JSON object, no additional text.`
        }]
      }],
      generationConfig: {
        temperature: 0.1, // Reduced temperature for more consistent output
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    const text = response.text().trim();
    
    console.log("Raw Gemini Response:", text);

    // Try to clean the response if it's not pure JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonText = text.slice(jsonStart, jsonEnd);

    try {
      const analysis = JSON.parse(jsonText);

      if (!analysis.themes || !Array.isArray(analysis.themes)) {
        console.error("Invalid response structure:", analysis);
        throw new Error("Invalid response format from Gemini");
      }

      // Transform and validate the themes
      return analysis.themes.map((theme: any, index: number) => {
        // Validate theme name
        if (!["Solution Requests", "Pain & Anger", "Advice Requests", "Money Talk"].includes(theme.name)) {
          console.warn(`Invalid theme name: ${theme.name}, using default`);
          theme.name = "Solution Requests";
        }

        // Validate sentiment
        if (!["positive", "negative", "neutral"].includes(theme.sentiment)) {
          theme.sentiment = "neutral";
        }

        return {
          id: `theme-${index + 1}`,
          name: theme.name,
          description: theme.description || `Posts related to ${theme.name}`,
          sentiment: theme.sentiment as "positive" | "negative" | "neutral",
          keywords: Array.isArray(theme.keywords) ? theme.keywords.slice(0, 5) : [],
          postCount: theme.posts?.length || 0,
          posts: (theme.posts || []).map((postId: string) => {
            const post = posts.find(p => p.id === postId);
            return {
              title: post?.title || "",
              url: post?.url || "",
              sentiment: theme.postSentiments?.[postId] || "neutral"
            };
          })
        };
      });
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Attempted to parse:", jsonText);
      throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error in analyzeRedditPosts:", error);
    throw error;
  }
} 