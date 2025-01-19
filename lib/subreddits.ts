export interface Subreddit {
  name: string;
  description: string;
  memberCount?: number;
}

export const defaultSubreddits: Subreddit[] = [
  {
    name: "ollama",
    description: "Community for Ollama, the open source AI model runner",
    memberCount: 8000
  },
  {
    name: "openai",
    description: "Discussions about OpenAI, ChatGPT, and AI technology",
    memberCount: 500000
  },
  {
    name: "typescript",
    description: "For all things TypeScript",
    memberCount: 126000
  }
]; 