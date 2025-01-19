import snoowrap from "snoowrap";

// Initialize the Snoowrap client
const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
});

export interface RedditPost {
  id: string;
  title: string;
  score: number;
  numComments: number;
  createdAt: string;
  url: string;
  content: string;
}

export async function fetchRecentPosts(subreddit: string): Promise<RedditPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 24 * 60 * 60;

  try {
    const posts = await reddit.getSubreddit(subreddit).getNew({ limit: 100 });
    
    const plainPosts = await Promise.all(posts.map(post => post.toJSON()));
    
    const recentPosts = plainPosts
      .filter((post) => post.created_utc > oneDayAgo)
      .map((post) => ({
        id: post.id,
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000).toISOString(),
        url: post.url
      }));

    return recentPosts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
} 