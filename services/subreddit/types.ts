export interface SubredditData {
  id: string;
  name: string;
  last_fetched_at: Date;
}

export interface RedditPostData {
  id: string;
  subreddit_id: string;
  reddit_post_id: string;
  title: string;
  content: string;
  score: number;
  num_comments: number;
  created_utc: Date;
  url: string;
  analyzed_at: Date;
  post_categories: { category_id: string; is_relevant: boolean }[];
}

export interface CategoryData {
  id: string;
  name: string;
  description: string;
}

export interface PostCategoryData {
  post_id: string;
  category_id: string;
  is_relevant: boolean;
} 