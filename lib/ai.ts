import { GoogleGenerativeAI } from "@google/generative-ai";
import { RedditPost } from "@/lib/reddit";
import { CATEGORY_IDS } from "@/lib/constants";

// Initialize Gemini AI with error handling
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AnalysisResult {
  categories: {
    id: string;
    name: string;
    is_relevant: boolean;
  }[];
}

export async function analyzePost(post: RedditPost): Promise<AnalysisResult> {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Sanitize input to prevent potential issues
    const sanitizedTitle = post.title?.substring(0, 1000) || '';
    const sanitizedContent = post.selftext?.substring(0, 2000) || '';

    const prompt = `
      Analyze this Reddit post and categorize it.
      
      Post Title: ${sanitizedTitle}
      Post Content: ${sanitizedContent || '(No content)'}
      
      Respond with a JSON object containing an array of categories. For each category, indicate if the post belongs to it (is_relevant).
      
      Categories to analyze:
      1. Solution Request: Posts seeking help or solutions
      2. Pain Point: Posts expressing frustration or problems
      3. Feature Request: Posts suggesting new features
      4. Bug Report: Posts reporting issues or bugs
      5. Success Story: Posts sharing positive experiences
      
      Respond ONLY with the JSON object, no additional text or formatting. Example format:
      {"categories":[{"id":"1","name":"Solution Request","is_relevant":true},{"id":"2","name":"Pain Point","is_relevant":false}]}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    console.log('AI Response:', text);
    
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const aiResponse = JSON.parse(jsonStr);
      
      console.log('Parsed Categories:', aiResponse.categories);
      
      return {
        categories: aiResponse.categories.map(cat => ({
          ...cat,
          id: cat.id === "1" ? CATEGORY_IDS.SOLUTION_REQUEST
            : cat.id === "2" ? CATEGORY_IDS.PAIN_POINT
            : cat.id === "3" ? CATEGORY_IDS.FEATURE_REQUEST
            : cat.id === "4" ? CATEGORY_IDS.BUG_REPORT
            : CATEGORY_IDS.SUCCESS_STORY
        }))
      };
    }
    
    throw new Error('Invalid JSON response from AI');
  } catch (error) {
    console.error('Error in analyzePost:', error);
    return getDefaultCategories();
  }
}

function getDefaultCategories(): AnalysisResult {
  return {
    categories: [
      { id: CATEGORY_IDS.SOLUTION_REQUEST, name: "Solution Request", is_relevant: false },
      { id: CATEGORY_IDS.PAIN_POINT, name: "Pain Point", is_relevant: false },
      { id: CATEGORY_IDS.FEATURE_REQUEST, name: "Feature Request", is_relevant: false },
      { id: CATEGORY_IDS.BUG_REPORT, name: "Bug Report", is_relevant: false },
      { id: CATEGORY_IDS.SUCCESS_STORY, name: "Success Story", is_relevant: false },
    ]
  };
} 