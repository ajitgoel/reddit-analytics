# Reddit Analytics Platform - Product Requirements Document

## 1. Introduction
This document outlines the requirements for building a Reddit analytics platform. The platform will allow users to manage subreddits, view top posts, and analyze post themes using Google's generative AI.

## 2. Project Overview
- **Platform Name**: Reddit Analytics Platform
- **Tech Stack**: Next.js 14, Shadcn, Tailwind, Lucid Icons
- **Goal**: Provide users with insights into subreddit activities through top posts and thematic analysis.

## 3. Core Functionalities

### Subreddit Management
- **Display Subreddits**: Show a list of available subreddits in card format, featuring popular ones like "ollama" and "openai."
- **Add Subreddit**: Allow users to add new subreddits by pasting a Reddit URL into a modal.
- **Update List**: Automatically update the subreddit list upon adding a new subreddit.

### Subreddit Page
- **Tabs**: Provide two tabs – "Top Posts" and "Themes" – for each subreddit.
- **Navigation**: Users can click on a subreddit card to view its detailed page.

### Top Posts
- **Fetch Data**: Use Snoowrap to fetch top posts from the subreddit over the past 24 hours.
- **Display Posts**: Show posts in a table, sorted by score, including title, score, content, URL, creation timestamp, and number of comments.

### Themes Analysis
- **Categorize Posts**: Use Google's generative AI to categorize each post into predefined themes:
  - Solution requests
  - Pain & anger
  - Advice requests
  - Money talk
- **Concurrent Processing**: Process post categorization concurrently for faster analysis.
- **Theme Cards**: Display theme categories with titles, descriptions, and counts. Clicking on a card opens a side panel showing all posts under that category.

### Dynamic Updates
- **Trigger Analysis**: Automatically trigger theme analysis when a new subreddit is added.

## 4. File Structure

### Root Directory
```
├── app/                    # Contains pages and routes
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── types/                # TypeScript type definitions
├── models/               # Data models if needed
├── .env.local            # Environment variables for local development
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

### App Directory Structure
```
app/
├── api/                  # API routes for external API interactions
├── subreddits/          # Pages related to subreddit management
├── subreddit/[subredditId]/ # Dynamic route for individual subreddit pages
├── layout.tsx           # Layout for the application
└── page.tsx             # Default page (subreddit list)
```

### Components Directory
```
components/
├── ui/                  # UI components like buttons, cards, modals, etc.
├── modals/             # Modal components
├── table/              # Table component for displaying posts
└── tabs/               # Tabs component for subreddit pages
```

### Lib Directory
```
lib/
├── reddit/             # Functions for interacting with the Reddit API
├── ai/                 # Functions for interacting with Google's generative AI
└── utils/              # Utility functions
```

### Types Directory
```
types/
├── post.ts             # Interface for Reddit posts
└── analysis.ts         # Interface for analysis results
```

## 5. Additional Requirements

### Project Setup
- All new components should be placed in the `/components` directory at the root
- All new pages should be placed in the `/app` directory
- Use the Next.js 14 app router
- All data fetching should be done in server components and passed down as props
- Client components requiring state management or hooks must include `'use client'` at the top

### Server-Side API Calls
- All interactions with external APIs should be handled server-side
- Create dedicated API routes in the `app/api` directory
- Client-side components should fetch data through these API routes

### Environment Variables
- Store sensitive information in environment variables
- Use `.env.local` file for local development
- Set environment variables in the deployment platform for production
- Access environment variables only in server-side code or API routes

### Error Handling and Logging
- Implement comprehensive error handling in all components
- Log errors on the server-side for debugging
- Display user-friendly error messages on the client-side

### Type Safety
- Use TypeScript interfaces for all data structures
- Avoid using `any` type; define proper types for all variables

### API Client Initialization
- Initialize API clients in server-side code only
- Implement checks to ensure proper client initialization

### Data Fetching in Components
- Use React hooks for data fetching in client-side components
- Implement loading states and error handling

### Next.js Configuration
- Utilize `next.config.mjs` for environment-specific configurations
- Use the `env` property for environment variables

### CORS and API Routes
- Use Next.js API routes to avoid CORS issues
- Implement proper request validation

### Component Structure
- Separate concerns between client and server components
- Use server components for initial data fetching

### Security
- Never expose API keys on the client-side
- Implement proper authentication and authorization

## 6. Documentation

### Reddit API Integration
```typescript
import Snoowrap from 'snoowrap';
import dotenv from 'dotenv';

dotenv.config();

const reddit = new Snoowrap({
  userAgent: 'MyApp/1.0.0',
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!
});

async function fetchOpenAIPosts(limit: number = 10) {
  try {
    const posts = await reddit.getSubreddit('openai').getNew({limit});

    posts.forEach((post) => {
      console.log(`Title: ${post.title}\nAuthor: ${post.author.name}\nScore: ${post.score}\nURL: ${post.url}\nCreated: ${new Date(post.created_utc * 1000).toLocaleString()}\n--------------------------------------------------`);
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}
```

### Google Generative AI Integration
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PostCategoryAnalysis, RedditPost } from '../types/PostAnalysis';

export class PostAnalyzer {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async analyzePost(post: RedditPost): Promise<PostCategoryAnalysis> {
    const prompt = this.buildPrompt(post);
    const result = await this.getPalmResponse(prompt);
    return this.parseResponse(result);
  }

  private buildPrompt(post: RedditPost): string {
    return `
      Analyze the following Reddit post and respond with ONLY "true" or "false" for each category:

      Post Title: ${post.title}
      Post Content: ${post.content}

      Categories to analyze:
      1. Solution Request: Is the user seeking a solution to a problem?
      2. Pain or Anger: Is the user expressing pain or anger?
      3. Advice Request: Is the user seeking advice?
      4. Money Related: Is the post about spending or money?

      Respond with only true/false values, one per line, nothing else.
    `;
  }
}
```

Example Analysis Output:
```json
{
  "isSolutionRequest": true,
  "isPainOrAnger": true,
  "isAdviceRequest": false,
  "isMoneyRelated": true
}
```

## 7. Conclusion
This PRD provides a comprehensive guide for developing the Reddit analytics platform. By following this document, developers will have a clear understanding of the project's structure, requirements, and expected functionalities, ensuring alignment and efficient implementation.