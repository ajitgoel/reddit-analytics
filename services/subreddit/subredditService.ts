import { createClient } from '@supabase/supabase-js';
import { SubredditData, RedditPostData, PostCategoryData } from './types';

export class SubredditService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getSubredditData(subredditName: string): Promise<{
    needsRefresh: boolean;
    posts?: RedditPostData[];
    categories?: PostCategoryData[];
  }> {
    try {
      // 1. Get subreddit info
      const { data: subreddit } = await this.supabase
        .from('subreddits')
        .select('*')
        .eq('name', subredditName)
        .single();

      // If no data exists or data is older than 24 hours, needs refresh
      const needsRefresh = !subreddit || 
        new Date(subreddit.last_fetched_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;

      if (!needsRefresh && subreddit) {
        // Get cached posts with their categories
        const { data: posts } = await this.supabase
          .from('posts')
          .select(`
            *,
            post_categories (
              category_id,
              is_relevant
            )
          `)
          .eq('subreddit_id', subreddit.id)
          .order('created_utc', { ascending: false });

        return {
          needsRefresh: false,
          posts: posts || [],
        };
      }

      return { needsRefresh: true };
    } catch (error) {
      console.error('Error in getSubredditData:', error);
      throw error;
    }
  }

  async updateSubredditData(
    subredditName: string,
    posts: RedditPostData[],
    categories: PostCategoryData[]
  ): Promise<void> {
    try {
      // 1. Update or insert subreddit
      const { data: subreddit, error: subredditError } = await this.supabase
        .from('subreddits')
        .upsert({
          name: subredditName,
          last_fetched_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (subredditError) throw new Error(`Failed to upsert subreddit: ${subredditError.message}`);
      if (!subreddit) throw new Error('Failed to get subreddit data after upsert');

      // 2. Insert new posts
      for (const post of posts) {
        const { data: dbPost, error: postError } = await this.supabase
          .from('posts')
          .upsert({
            subreddit_id: subreddit.id,
            ...post,
          })
          .select('id')
          .single();

        if (postError) throw new Error(`Failed to upsert post: ${postError.message}`);
        if (!dbPost) throw new Error('Failed to get post data after upsert');

        // 3. Insert post categories
        const postCategories = categories
          .filter(cat => cat.post_id === post.reddit_post_id)
          .map(cat => ({
            post_id: dbPost.id,
            category_id: cat.category_id,
            is_relevant: cat.is_relevant,
          }));

        if (postCategories.length > 0) {
          const { error: categoryError } = await this.supabase
            .from('post_categories')
            .upsert(postCategories);

          if (categoryError) {
            throw new Error(`Failed to upsert categories: ${categoryError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in updateSubredditData:', error);
      throw error;
    }
  }
}

export const subredditService = new SubredditService(); 