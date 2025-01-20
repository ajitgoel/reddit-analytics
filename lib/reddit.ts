import Snoowrap from 'snoowrap';

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
}

let redditClient: Snoowrap | null = null;

export function getRedditClient(): Snoowrap {
  if (!redditClient) {
    redditClient = new Snoowrap({
      userAgent: 'reddit-analytics-app',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!
    });
  }
  return redditClient;
}

export async function fetchRecentPosts(subreddit: string): Promise<RedditPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 24 * 60 * 60;

  try {
    console.log(`Fetching posts for r/${subreddit}`);
    const posts = await getRedditClient().getSubreddit(subreddit).getNew({ limit: 100 });
    console.log('Raw Reddit response:', posts);
    
    const plainPosts = await Promise.all(posts.map(post => post.toJSON()));
    console.log('Plain posts:', plainPosts);

    const recentPosts = plainPosts
      .filter((post) => post.created_utc > oneDayAgo)
      .map((post) => ({
        id: post.id,
        title: post.title,
        content: post.selftext || post.title, // Use title as fallback content
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000).toISOString(),
        url: `https://reddit.com${post.permalink}`
      }));

    console.log(`Found ${recentPosts.length} recent posts`);
    return recentPosts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
} 