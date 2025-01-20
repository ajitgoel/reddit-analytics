# Supabase Integration for Reddit Analytics Platform

## 1. Objective
Optimize data fetching and processing by integrating Supabase to cache Reddit posts and their AI-generated analyses. Data will be refreshed only if the last update is older than 24 hours, reducing redundant API calls to Reddit and OpenAI/Gemini.

## 2. System Overview

### Current Architecture
- Frontend: Next.js 14 (React) with Shadcn UI
- Data Flow:
  1. User navigates to a subreddit page
  2. Reddit posts are fetched via Snoowrap (Reddit API)
  3. Each post is analyzed via Gemini/OpenAI API for categorization
  4. Results are displayed in the UI

### Proposed Architecture with Supabase
Supabase acts as a caching layer for subreddit data and analysis results.

New Data Flow:
1. User navigates to a subreddit page
2. Check Supabase for cached data
3. If data is fresh (<24hr old): Serve cached data
4. If data is stale (≥24hr old):
   - Fetch new posts from Reddit
   - Re-analyze posts via Gemini/OpenAI
   - Update Supabase with new data
5. For new categories added by users, trigger re-analysis of existing posts

## 3. Database Schema Design

### Tables

#### 1. subreddits
Stores metadata for tracked subreddits.

```sql
CREATE TABLE subreddits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,  -- e.g., "ollama"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_fetched_at TIMESTAMPTZ  -- Last time data was fetched from Reddit
);
```

#### 2. posts
Stores Reddit post data and analysis timestamps.

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subreddit_id UUID REFERENCES subreddits(id) ON DELETE CASCADE,
  reddit_post_id VARCHAR(255) UNIQUE NOT NULL,  -- Reddit's internal ID (e.g., "t3_abc123")
  title TEXT,
  content TEXT,
  score INT,
  num_comments INT,
  created_utc TIMESTAMPTZ,  -- Original Reddit post timestamp
  url TEXT,
  analyzed_at TIMESTAMPTZ,  -- Last time AI analysis was performed
  CONSTRAINT fk_subreddit FOREIGN KEY(subreddit_id) REFERENCES subreddits(id)
);
```

#### 3. categories
Stores user-defined and default post categories.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,  -- e.g., "Solution Request"
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. post_categories
Maps posts to categories with AI analysis results.

```sql
CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_relevant BOOLEAN,  -- Result from AI analysis (true/false)
  PRIMARY KEY (post_id, category_id)
);
```

### Indexes
Add indexes for frequent queries:
- subreddits(name)
- posts(subreddit_id, created_utc)
- post_categories(post_id)

## 4. Key Integration Components

### 1. Supabase Client Setup
Environment Variables:
- SUPABASE_URL
- SUPABASE_ANON_KEY

Initialization:
- Use @supabase/supabase-js in Next.js API routes or server-side logic

### 2. Data Fetching Workflow

#### Step 1: Check Cached Data

```typescript
// Pseudocode
async function getSubredditData(subredditName: string) {
  // 1. Fetch subreddit from Supabase
  const subreddit = await supabase
    .from('subreddits')
    .select('*')
    .eq('name', subredditName)
    .single();

  // 2. If data exists and is fresh (<24hr old), return cached posts
  if (subreddit && subreddit.last_fetched_at > Date.now() - 24hr) {
    const posts = await supabase
      .from('posts')
      .select('*, post_categories(*)')
      .eq('subreddit_id', subreddit.id);
    return posts;
  }

  // 3. Else, fetch new data from Reddit + AI and update Supabase
  return refreshSubredditData(subredditName);
}
```

#### Step 2: Refresh Stale Data

```typescript
// Pseudocode
async function refreshSubredditData(subredditName: string) {
  // 1. Fetch new posts from Reddit API
  const newPosts = await fetchRecentPosts(subredditName); // Existing Snoowrap logic

  // 2. Analyze posts with Gemini/OpenAI
  const analyzedPosts = await analyzePosts(newPosts); // Existing AI logic

  // 3. Update Supabase
  await supabase.transaction(async (tx) => {
    // Update subreddit's last_fetched_at
    await tx.from('subreddits').upsert({
      name: subredditName,
      last_fetched_at: new Date().toISOString(),
    });

    // Insert new posts and their categories
    for (const post of analyzedPosts) {
      const { data: dbPost } = await tx.from('posts')
        .upsert({ reddit_post_id: post.id, ...post })
        .select('id')
        .single();

      for (const category of post.categories) {
        await tx.from('post_categories').upsert({
          post_id: dbPost.id,
          category_id: category.id,
          is_relevant: category.is_relevant,
        });
      }
    }
  });
}
```

### 3. Handling New Categories
Scenario: User adds a new category (e.g., "Security Concerns")

Action:
1. Insert new category into categories table
2. Trigger re-analysis of all posts for the subreddit:
   - Fetch all posts from Supabase
   - Re-run AI analysis including the new category
   - Update post_categories with new results

## 5. Performance Considerations

### Caching Strategies
- Subreddit List: Cache the home page's subreddit list client-side (e.g., 1 hour)
- Stale-While-Revalidate: Serve stale data while refreshing in the background if the user tolerates slight delays

### Batch Processing
- Process posts in batches (e.g., 10 at a time) to avoid AI API rate limits

### Indexing
- Add indexes to frequently queried columns (e.g., subreddits.name, posts.created_utc)

## 6. Error Handling

### Supabase Failures
- Retry failed transactions (e.g., 3 attempts)
- Fall back to direct Reddit/AI API calls if Supabase is unavailable

### Data Consistency
- Use database transactions for inserts/updates
- Add ON DELETE CASCADE to foreign keys for automatic cleanup

## 7. Security
- Row-Level Security (RLS): Enable RLS on Supabase tables if the app has multi-user support
- API Keys: Store Reddit and AI keys in environment variables (never in client code)

## 8. Integration with Existing Codebase

### Modified Components

#### Subreddit Page (app/[subreddit]/page.tsx)
- Replace direct Reddit API calls with Supabase checks
- Add logic to trigger background refreshes for stale data

#### Themes Tab (app/[subreddit]/themes/page.tsx)
- Fetch category mappings from post_categories table
- Add logic for re-analysis when new categories are added

### New Utility Functions

#### lib/supabase.ts
- Supabase client initialization
- Helper functions for common operations (e.g., getCachedSubredditData)

## 9. Deliverables

### Supabase Project Setup
- Tables with the schema above
- RLS policies and indexes

### Data Layer Integration
- Implement getSubredditData and refreshSubredditData logic
- Add utility functions for CRUD operations on categories

### Re-analysis Trigger
- Add endpoint/webhook to re-analyze posts when new categories are added