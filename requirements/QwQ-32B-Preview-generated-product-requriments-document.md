Alright, I've got this Product Requirements Document (PRD) for building a Reddit analytics platform using Next.js 14, Shadcn UI, Tailwind CSS, and Lucide icons. The goal is to provide clear alignment for developers who will be implementing the project. I need to add details to the original PRD, including the file structure and additional requirements, while incorporating all the provided documentation and example code.

First, I need to make sure that the core functionalities are clearly outlined. From the initial document, the main features are:

Displaying a list of available subreddits and allowing users to add new ones.

Providing a subreddit page with tabs for "Top posts" and "Themes."

Fetching and displaying top posts from Reddit using Snoowrap.

Analyzing posts using Google's Gemini API and categorizing them into themes.

Allowing users to add new cards for additional subreddits, which triggers re-analysis.

I should ensure that each of these functionalities is detailed enough for developers to understand what needs to be built.

Starting with the first functionality: seeing the list of available subreddits and adding new ones.

See list of available subreddits & add new subreddits

Display a list of subreddits in cards: Show existing subreddits like "ollama" and "openai" in card formats. Each card should represent a subreddit and display relevant information such as the subreddit name, perhaps a brief description, and any other pertinent details.

Add new subreddit modal: Implement an "Add Subreddit" button that, when clicked, opens a modal. This modal should allow users to paste a Reddit URL and add a new subreddit to the list.

Dynamic addition of subreddit cards: After adding a new subreddit through the modal, a new card should appear in the list immediately, reflecting the addition.

For the second functionality: the subreddit page with tabs for "Top posts" and "Themes."

Subreddit page

Tab navigation: Implement tab navigation within the subreddit page to switch between "Top posts" and "Themes." This likely involves using a tab component that allows switching between different views.

Top posts tab: Displays the top posts from the subreddit fetched using Snoowrap.

Themes tab: Displays categorized themes based on analysis from Google's Gemini API.

Moving on to fetching Reddit posts data for the "Top posts" tab.

Fetch reddit posts data in "Top posts"

Use Snoowrap to fetch data: Developers need to use the Snoowrap library to fetch posts from Reddit. They should handle authentication and setup as per Snoowrap's requirements.

Display posts in a table: The fetched posts should be displayed in a table, showing attributes like title, score, content, URL, creation time, and number of comments. The table should be sortable based on the post's score.

For analyzing Reddit posts data in the "Themes" tab:

Analyze reddit posts data in "Themes"

Categorize posts using Gemini API: Each post should be sent to Google's Gemini API for categorization into one of four themes: "Solution requests," "Pain & anger," "Advice requests," "Money talk."

Concurrent analysis for speed: The analysis should be performed concurrently for multiple posts to improve speed.

Display theme cards: Show each category as a card with a title, description, and the count of posts in that category.

Side panel for post details: Clicking on a theme card should open a side panel displaying all posts categorized under that theme.

Lastly, the ability to add new cards and trigger analysis again.

Ability to add new cards

Add new subreddit cards: Users should be able to add new subreddit cards, which involves repeating the process of adding a new subreddit and displaying its card.

Trigger analysis again: Adding a new card should initiate the analysis process for the new subreddit's posts.

Now, regarding the file structure. According to the additional requirements, all new components should go into the

/components
directory at the root, named like
example-component.tsx
, unless specified otherwise. All new pages should go into the
/app
directory, utilizing Next.js 14's app router.
Given this, I need to propose a file structure that organizes the components and pages appropriately.

Proposed File Structure


.

├── app

│   ├── subreddit

│   │   ├── [subredditId]

│   │   │   ├── themes

│   │   │   │   └── page.tsx

│   │   │   ├── top-posts

│   │   │   │   └── page.tsx

│   │   │   └── page.tsx

│   │   └── page.tsx

│   ├── api

│   │   ├── reddit

│   │   │   └── route.ts

│   │   └── analyze

│   │       └── route.ts

│   └── layout.tsx

│   └── page.tsx

├── components

│   ├── subreddit-card.tsx

│   ├── modal.tsx

│   ├── table.tsx

│   ├── theme-card.tsx

│   ├── side-panel.tsx

│   ├── button.tsx

│   ├── input.tsx

│   └── ...

├── lib

│   ├── snoowrap.ts

│   ├── palm.ts

│   └── ...

├── requirements.txt

├── .eslintrc.json

├── components.json

├── next-env.d.ts

├── next.config.mjs

├── package-lock.json

├── package.json

├── postcss.config.mjs

├── README.md

├── tailwind.config.ts

├── tsconfig.json

├── fonts

│   └── ...

├── favicon.ico

├── globals.css

├── utils.ts

├── backend_instructions.md

├── cursor-notes.md

├── frontend_instructions.md

├── project-instructions.md

├── prompts.md

└── vo.md
Explanation of File Structure


app/subreddit
: This directory holds pages related to subreddits.

page.tsx
: Displays the list of subreddit cards.

[subredditId]/
: A dynamic segment for individual subreddit pages.

page.tsx
: Default page for the subreddit, perhaps an overview.

themes/
: Page for theme analysis.
page.tsx
: Displays theme categories and their posts.

top-posts/
: Page for displaying top posts.
page.tsx
: Shows a table of top posts.

app/api
: Contains API routes for handling data fetching and external API calls.

reddit/route.ts
: Handles fetching posts from Reddit.

analyze/route.ts
: Handles post analysis using Gemini API.

components
: Reusable components used across the application.

subreddit-card.tsx
: Component for displaying a subreddit card.

modal.tsx
: Modal for adding new subreddits.

table.tsx
: Table component for displaying posts.

theme-card.tsx
: Component for theme category cards.

side-panel.tsx
: Side panel for showing detailed posts under a theme.

button.tsx
and
input.tsx
: Reusable button and input components.

lib
: Helper modules or utility functions.

snoowrap.ts
: Contains functions for interacting with Snoowrap.

palm.ts
: Contains functions for interacting with Google's Gemini API.
Other配置 files and utilities: Standard files for a Next.js project, including configuration files, type definitions, and scripts.

Additional Requirements

Project Setup

Adhere to the specified directory structures for components and pages.

Use the Next.js 14 app router.

Perform all data fetching in server components and pass data down as props.

Use

use client
for client components that require state or hooks.
Server-Side API Calls

Handle all external API interactions server-side via dedicated API routes in the

app/api
directory.
Client-side components should fetch data through these API routes.

Environment Variables

Store sensitive information in environment variables using a

.env.local
file for local development.
Ensure

.env.local
is in
.gitignore
to prevent exposing secrets.
Set environment variables in the deployment platform for production.

Access environment variables only in server-side code or API routes.

Error Handling and Logging

Implement comprehensive error handling in both client and server components.

Log errors on the server side for debugging.

Display user-friendly error messages on the client side.

Type Safety

Use TypeScript interfaces for all data structures.

Avoid using

any
type; define proper types for variables and function parameters.
API Client Initialization

Initialize API clients (Snoowrap, Gemini API) in server-side code only.

Implement checks to ensure API clients are properly initialized before use.

Data Fetching in Components

Use React hooks like

useEffect
for data fetching in client-side components.
Implement loading states and error handling for data fetching operations.

Next.js Configuration

Use

next.config.mjs
for environment-specific configurations.
Make environment variables available to the application via

env
in
next.config.mjs
.
CORS and API Routes

Use Next.js API routes to avoid CORS issues when interacting with external APIs.

Implement proper request validation in API routes.

Component Structure

Separate concerns between client and server components.

Use server components for initial data fetching and pass data as props to client components.

Security

Never expose API keys or sensitive credentials on the client side.

Implement proper authentication and authorization for API routes if needed.

Documentation and Example Code

Snoowrap Example: Provided code shows how to set up Snoowrap with environment variables and fetch new posts from a subreddit.

Gemini API Example: Example of using the Google Generative AI client to analyze Reddit posts and categorize them into predefined themes.

Type Definitions: Mention of type definitions in

types/PostAnalysis
suggests that there are TypeScript interfaces defined for post data and analysis results.
Developers should refer to these examples and ensure that their implementations align with the provided code structures and best practices.

In summary, this PRD aims to provide a clear roadmap for building a Reddit analytics platform with specific technical requirements and a structured approach to development. By following this guide, developers should be able to implement the project efficiently and effectively.