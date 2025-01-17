**# Project overview**
You are building a Reddit analytics platform, where users can get analytics of different sub reddits, where they can see top contents & see category of posts;

You will be using NextJS 14, shadcn, tailwind, Lucid icon

**# Core functionalities**
1. See list of available sub reddits & add new sub reddits
   1. Users can see list of available sub reddits that already created display in cards, common ones like "ollama", "openai"
   2. Users can clicking on an add reddit button, which should open a modal for users to paste in reddit url and add
   3. After users adding a new reddit, a new card should be added
2. Subreddit page
   1. Clicking on each subreddit, should goes to a reddit page
   2. With 2 tabs: "Top posts", "Themes"
3. Fetch reddit posts data in "Top posts"
    1. Under "Top posts" page, we want to display fetched reddit posts from past 24 hrs
    2. We will use snoowrap as library to fetch reddit data
    3. Each post including title, score, content, url, created_utc, num_comments
    4. Display the reddits in a table component, Sort based on num of score
4. Analyse reddit posts data in "Themes"
    1. For each post, we should send post data to google flash using structured output to categorise “Solution requests”, “Pain & anger”, “Advice requests”, “Money talk”; 
       1. "Solution requests": Posts where people are seeking solutions for problems
       2. "Pain & anger": Posts where people are expressing pains or anger
       3. "Advice requests": Posts where people are seeking advice
       4. "Money talk": Posts where people are talking about spending money
    2. This process needs to be ran concurrently for posts, so it will be faster 
    3. In "Themes" page, we should display each category as a card, with title, description & num of counts
    4. Clicking on the card will open side panel to display all posts under this category
5. Ability to add new cards
    1. Users should be able to add a new card
    2. After a new card is added, it should trigger the analysis again

**# Doc**
### Documentation on how to use snoowrap to fetch Reddit post data:
```
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
    // Get the latest posts from r/openai
    const posts = await reddit.getSubreddit('openai').getNew({limit});
    
    // Process and print each post
    posts.forEach((post) => {
      console.log(`
Title: ${post.title}
Author: ${post.author.name}
Score: ${post.score}
URL: ${post.url}
Created: ${new Date(post.created_utc * 1000).toLocaleString()}
${'-'.repeat(50)}
      `);
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

// Execute the function
fetchOpenAIPosts(); 
```

### Documentation on how to return structured output from google flash api:
```
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
      Analyze the following Reddit post and respond with ONLY "true" or "false" for each category, one per line:
      
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

  private async getPalmResponse(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private parseResponse(response: string): PostCategoryAnalysis {
    const lines = response.trim().split('\n');
    
    return {
      isSolutionRequest: this.parseBoolean(lines[0]),
      isPainOrAnger: this.parseBoolean(lines[1]),
      isAdviceRequest: this.parseBoolean(lines[2]),
      isMoneyRelated: this.parseBoolean(lines[3])
    };
  }

  private parseBoolean(value: string): boolean {
    return value.toLowerCase().trim() === 'true';
  }
} 
```
## example output from google flash api:
```
Post Analysis: {
  isSolutionRequest: true,
  isPainOrAnger: true,
  isAdviceRequest: false,
  isMoneyRelated: true
}
```


**# Current file structure**
app
  components
  lib
  requirements
  .eslintrc.json
  components.json
  next-env.d.ts
  next.config.mjs
  package-lock.json
  package.json
  postcss.config.mjs
  README.md
  tailwind.config.ts
  tsconfig.json
      fonts
      favicon.ico
      globals.css
      layout.tsx
      page.tsx
          GeistMonoVF.woff
          GeistVF.woff
      ui
          badge.tsx
          button.tsx
          card.tsx
          input.tsx
          label.tsx
          sheet.tsx
          table.tsx
          tabs.tsx
      utils.ts
      backend_instructions.md
      cursor-notes.md
      frontend_instructions.md
      project-instructions.md
      prompts.md
      vo.md

**# Additional requirements**
1. Project setup
   - All new components should go in /components at the root (not in the app folder) and be named like example-component.tsx unless otherwise specified
   - All new pages go in /app
   - Use the Next.js 14 app router
   - All data fetching should be done in a server component and pass the data down as props
   - Client components (useState, hooks, etc) require that 'use client' is set at the top of the file

2. Server-Side API Calls:
   - All interactions with external APIs (e.g., Reddit, google flash) should be performed server-side.
   - Create dedicated API routes in the `pages/api` directory for each external API interaction.
   - Client-side components should fetch data through these API routes, not directly from external APIs.

3. Environment Variables:
   - Store all sensitive information (API keys, credentials) in environment variables.
   - Use a `.env.local` file for local development and ensure it's listed in `.gitignore`.
   - For production, set environment variables in the deployment platform (e.g., Vercel).
   - Access environment variables only in server-side code or API routes.

4. Error Handling and Logging:
   - Implement comprehensive error handling in both client-side components and server-side API routes.
   - Log errors on the server-side for debugging purposes.
   - Display user-friendly error messages on the client-side.

5. Type Safety:
   - Use TypeScript interfaces for all data structures, especially API responses.
   - Avoid using `any` type; instead, define proper types for all variables and function parameters.

6. API Client Initialization:
   - Initialize API clients (e.g., Snoowrap for Reddit, google flash) in server-side code only.
   - Implement checks to ensure API clients are properly initialized before use.

7. Data Fetching in Components:
   - Use React hooks (e.g., `useEffect`) for data fetching in client-side components.
   - Implement loading states and error handling for all data fetching operations.

8. Next.js Configuration:
   - Utilize `next.config.mjs` for environment-specific configurations.
   - Use the `env` property in `next.config.mjs` to make environment variables available to the application.

9.  CORS and API Routes:
   - Use Next.js API routes to avoid CORS issues when interacting with external APIs.
   - Implement proper request validation in API routes.

10. Component Structure:
   - Separate concerns between client and server components.
   - Use server components for initial data fetching and pass data as props to client components.

11. Security:
    - Never expose API keys or sensitive credentials on the client-side.
    - Implement proper authentication and authorization for API routes if needed.

----
Above is the project i want to build, 
How should I structure my project files? 
- All new components should go in /components at the root (not in the app folder) and be named like example-component.tsx unless otherwise specified
- All new pages go in /app
- Use the Next.js 14 app router
- All data fetching should be done in a server component and pass the data down as props
- Client components (useState, hooks, etc) require that 'use client' is set at the top of the file

---------------------------------

Help me adding details to the original PRD that give clear alignment to developers who will implement the project;
- dont create actual code, just the PRD
- including file structure & additional requirements into the doc
- including all documentations provided (with both example code & responses, those are important context)

-----------------------------

