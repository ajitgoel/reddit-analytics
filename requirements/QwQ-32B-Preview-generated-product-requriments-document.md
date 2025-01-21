# Reddit Analytics Platform PRD

## Overview
This Product Requirements Document (PRD) outlines the development specifications for a Reddit analytics platform built with Next.js 14, Shadcn UI, Tailwind CSS, and Lucide icons. The platform provides analytics and theme categorization for Reddit content.

## Core Functionalities

### 1. Subreddit Management
#### See List of Available Subreddits & Add New Subreddits
- Display subreddits in card format (e.g., "ollama", "openai")
- Each card shows subreddit name and relevant information
- Implement "Add Subreddit" button with modal interface
- Modal allows URL input for new subreddit addition
- Dynamic card creation upon new subreddit addition

### 2. Subreddit Page Structure
#### Tab Navigation
- Implement tabs for "Top posts" and "Themes"
- Top posts tab displays Snoowrap-fetched content
- Themes tab shows Gemini API categorization results

### 3. Top Posts Feature
#### Fetch Reddit Posts Data
- Integrate Snoowrap for Reddit data retrieval
- Handle authentication and setup requirements
- Display posts in sortable table format
- Include columns for:
  - Title
  - Score
  - Content
  - URL
  - Creation time
  - Comment count

### 4. Theme Analysis
#### Analyze Reddit Posts Data
- Use Google's Gemini API for post categorization
- Implement concurrent analysis for performance
- Categorize posts into themes:
  - Solution requests
  - Pain & anger
  - Advice requests
  - Money talk
- Display theme cards with:
  - Title
  - Description
  - Post count
- Side panel implementation for detailed theme view

### 5. Card Management
- Enable addition of new subreddit cards
- Trigger automatic analysis for new subreddits

## Technical Architecture

### File Structure
```
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
└── [configuration files]
```

### Directory Structure Explanation

#### App Directory
- **/app/subreddit**: Subreddit-related pages
- **/app/subreddit/[subredditId]**: Dynamic subreddit routes
- **/app/api**: API route handlers
- **/app/api/reddit**: Reddit data fetching
- **/app/api/analyze**: Gemini API integration

#### Components Directory
- Component naming convention: example-component.tsx
- Houses reusable UI components
- Includes cards, modals, tables, and common UI elements

#### Lib Directory
- External API integrations
- Utility functions and helpers

## Technical Requirements

### Project Setup
- Use Next.js 14 app router
- Implement server components for data fetching
- Use `use client` directive for client components
- Follow specified directory structure

### API Integration
- Handle external API calls server-side
- Implement dedicated API routes
- Ensure proper error handling
- Use environment variables for sensitive data

### Development Guidelines
1. **Environment Variables**
   - Store sensitive data in .env.local
   - Include .env.local in .gitignore
   - Configure deployment platform variables
   - Access restricted to server-side code

2. **Error Handling**
   - Implement comprehensive error handling
   - Server-side error logging
   - User-friendly client-side messages

3. **Type Safety**
   - Use TypeScript interfaces
   - Avoid `any` type usage
   - Define proper types throughout

4. **API Client Setup**
   - Server-side initialization only
   - Implement initialization checks
   - Handle authentication properly

5. **Data Fetching**
   - Use React hooks appropriately
   - Implement loading states
   - Handle errors gracefully

6. **Security**
   - Protect sensitive credentials
   - Implement proper authentication
   - Validate API requests

### Configuration
- Use next.config.mjs for environment settings
- Configure CORS in API routes
- Implement proper request validation

## Documentation References
- Refer to provided Snoowrap examples
- Review Gemini API integration examples
- Follow TypeScript interface definitions
- Consult backend and frontend instruction documents