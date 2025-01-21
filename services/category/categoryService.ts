import { createClient } from '@supabase/supabase-js';
import type { CategoryData } from '../subreddit/types';

export class CategoryService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getAllCategories(): Promise<CategoryData[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  }

  async addCategory(name: string, description: string): Promise<CategoryData> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create category');

      // Trigger re-analysis of all posts for this new category
      await this.triggerReanalysis(data.id);

      return data;
    } catch (error) {
      console.error('Error in addCategory:', error);
      throw error;
    }
  }

  private async triggerReanalysis(newCategoryId: string): Promise<void> {
    try {
      // 1. Get all posts from the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: posts, error: postsError } = await this.supabase
        .from('posts')
        .select('id, title, content')
        .gte('created_utc', oneDayAgo.toISOString());

      if (postsError) throw postsError;

      // 2. Re-analyze each post for the new category
      for (const post of posts || []) {
        const analysis = await this.analyzePostForCategory(post, newCategoryId);
        
        // 3. Store the analysis result
        const { error: analysisError } = await this.supabase
          .from('post_categories')
          .insert({
            post_id: post.id,
            category_id: newCategoryId,
            is_relevant: analysis.is_relevant,
          });

        if (analysisError) throw analysisError;
      }
    } catch (error) {
      console.error('Error in triggerReanalysis:', error);
      throw error;
    }
  }

  private async analyzePostForCategory(
    post: { title: string; content: string },
    categoryId: string
  ): Promise<{ is_relevant: boolean }> {
    try {
      // Get category details
      const { data: category } = await this.supabase
        .from('categories')
        .select('name, description')
        .eq('id', categoryId)
        .single();

      if (!category) throw new Error('Category not found');

      // Use AI to analyze if the post belongs to this category
      const prompt = `
        Analyze this Reddit post and determine if it belongs to the category: ${category.name}
        Category description: ${category.description}

        Post Title: ${post.title}
        Post Content: ${post.content}

        Respond with a JSON object containing a single boolean field "is_relevant".
        Example: {"is_relevant": true}
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();
      
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error('Invalid AI response format');

      const analysis = JSON.parse(jsonMatch[0]);
      return { is_relevant: !!analysis.is_relevant };
    } catch (error) {
      console.error('Error analyzing post for new category:', error);
      return { is_relevant: false };
    }
  }
}

export const categoryService = new CategoryService(); 