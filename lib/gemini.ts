import { GoogleGenerativeAI, RequestOptions } from "@google/generative-ai";
import { RedditPost } from "./reddit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const customHeaders = new Headers({
  "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  "Helicone-Target-URL": `https://generativelanguage.googleapis.com`,
});

const requestOptions = {
  customHeaders: customHeaders,
  baseUrl: "https://gateway.helicone.ai",
} as RequestOptions;

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

export interface PostAnalysis {
  categories: string[];
  sentiment: "positive" | "negative" | "neutral";
}

export async function analyzePost(post: RedditPost): Promise<PostAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" }, requestOptions);

  const prompt = `
Analyze this Reddit post and determine which categories it belongs to.
Categories must be from: "Solution Requests", "Pain & Anger", "Advice Requests", "Money Talk"
A post can belong to multiple categories.

Post title: ${post.title}
${post.content ? `Post content: ${post.content}` : ''}

Return ONLY a JSON object with this structure (no markdown, no backticks, no explanation):
{
  "categories": ["Category1", "Category2"],
  "sentiment": "positive|negative|neutral"
}`;

  const result = await model.generateContent({
    contents: [{ 
      role: "user", 
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  });

  const response = await result.response;
  const text = response.text().trim();

  try {
    // Clean the response by removing markdown formatting
    const cleanedText = text
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim();                     // Remove extra whitespace

    // Find the JSON object in the response
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    const jsonText = cleanedText.slice(jsonStart, jsonEnd);

    const analysis = JSON.parse(jsonText);

    // Validate and filter categories
    const validCategories = ["Solution Requests", "Pain & Anger", "Advice Requests", "Money Talk"];
    const categories = Array.isArray(analysis.categories) 
      ? analysis.categories.filter((cat: string) => validCategories.includes(cat))
      : [];

    // Validate sentiment
    const validSentiments = ["positive", "negative", "neutral"];
    const sentiment = validSentiments.includes(analysis.sentiment) 
      ? analysis.sentiment 
      : "neutral";

    return { categories, sentiment };
  } catch (error) {
    console.error("Error parsing post analysis:", error);
    console.error("Raw response:", text);
    return { categories: [], sentiment: "neutral" };
  }
}

export async function analyzeRedditPosts(posts: RedditPost[]): Promise<Theme[]> {
  try {
    // First analyze each post individually
    const postAnalyses = await Promise.all(
      posts.map(async post => {
        const analysis = await analyzePost(post);
        return {
          ...post,
          categories: analysis.categories,
          sentiment: analysis.sentiment
        };
      })
    );

    // Group posts by theme
    const themeMap = new Map<string, Theme>();
    
    postAnalyses.forEach(post => {
      post.categories.forEach(category => {
        if (!themeMap.has(category)) {
          themeMap.set(category, {
            id: category.toLowerCase().replace(/\s+/g, '-'),
            name: category,
            description: `Posts related to ${category}`,
            sentiment: "neutral",
            keywords: [],
            postCount: 0,
            posts: []
          });
        }

        const theme = themeMap.get(category)!;
        theme.postCount++;
        theme.posts.push({
          title: post.title,
          url: post.url,
          sentiment: post.sentiment
        });
      });
    });

    return Array.from(themeMap.values());
  } catch (error) {
    console.error("Error analyzing posts:", error);
    throw error;
  }
} 