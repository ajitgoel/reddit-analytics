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
      // 1. Get or create subreddit with Reddit data
      const redditResponse = await fetch(
        `https://www.reddit.com/r/${subredditName}/about.json`
      );
      
      if (!redditResponse.ok) {
        throw new Error(`Failed to fetch subreddit data from Reddit: ${redditResponse.statusText}`);
      }
      
      const redditData = await redditResponse.json();

      const { data: subreddit, error: subredditError } = await this.supabase
        .from('subreddits')
        .upsert({ 
          name: subredditName.toLowerCase(),
          last_fetched_at: null,  // Force refresh for new subreddits
          member_count: redditData.data?.subscribers || 0,
          description: redditData.data?.public_description || `r/${subredditName} community`,
        }, {
          onConflict: 'name'
        })
        .select('*')
        .single();

      if (subredditError) throw subredditError;

      // If no data exists or data is older than 24 hours, needs refresh
      const needsRefresh = !subreddit?.last_fetched_at || 
        new Date(subreddit.last_fetched_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;

      if (!needsRefresh) {
        // Get cached posts with their categories
        const { data: posts, error: postsError } = await this.supabase
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

        if (postsError) throw postsError;

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
      // 1. Get the existing subreddit
      const { data: subreddit, error: subredditError } = await this.supabase
        .from('subreddits')
        .select('id')
        .eq('name', subredditName.toLowerCase())
        .single();

      if (subredditError) throw new Error(`Failed to get subreddit: ${subredditError.message}`);
      if (!subreddit) throw new Error('Subreddit not found');

      // Update last_fetched_at
      const { error: updateError } = await this.supabase
        .from('subreddits')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', subreddit.id);

      if (updateError) throw new Error(`Failed to update subreddit: ${updateError.message}`);

      // 2. Insert new posts
      for (const post of posts) {
        try {
          // First, insert the post
          const { data: dbPost, error: postError } = await this.supabase
            .from('posts')
            .upsert(
              {
                subreddit_id: subreddit.id,
                reddit_post_id: post.reddit_post_id,
                title: post.title || '',
                content: post.content || '',
                score: post.score || 0,
                num_comments: post.num_comments || 0,
                created_utc: post.created_utc || new Date(),
                url: post.url || '',
                analyzed_at: post.analyzed_at || new Date()
              },
              {
                onConflict: 'reddit_post_id',
                merge: true,
              }
            )
            .select('id')
            .single();

          if (postError) {
            console.error('Post upsert error:', postError.message);
            continue;
          }
          if (!dbPost) continue;

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
              .upsert(postCategories, {
                onConflict: 'post_id,category_id',
                merge: true,
              });

            if (categoryError) {
              console.error('Category upsert error:', categoryError.message);
            }
          }
        } catch (error) {
          console.error('Error processing post:', error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error in updateSubredditData:', error);
      throw error;
    }
  }

  async addSubreddit(name: string): Promise<void> {
    try {
      // Fetch subreddit info from Reddit
      const response = await fetch(
        `https://www.reddit.com/r/${name}/about.json`
      );
      const data = await response.json();

      const { error } = await this.supabase
        .from('subreddits')
        .upsert({
          name: name.toLowerCase(),
          last_fetched_at: null,  // Force initial fetch
          member_count: data.data?.subscribers || 0,
          description: data.data?.public_description || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error in addSubreddit:', error);
      throw error;
    }
  }

  async getAllSubreddits(): Promise<SubredditData[]> {
    try {
      const { data, error } = await this.supabase
        .from('subreddits')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getAllSubreddits:', error);
      throw error;
    }
  }
}

export const subredditService = new SubredditService(); 