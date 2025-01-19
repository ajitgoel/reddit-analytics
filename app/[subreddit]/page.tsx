"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { use } from "react";
import { PostsTable, type RedditPost } from "@/components/PostsTable";
import { ThemeCard, type Theme } from "@/components/ThemeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getSubredditPosts } from "@/app/actions/reddit";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface PageProps {
  params: Promise<{ subreddit: string }>;
}

// Mock data - replace with actual API calls
const mockPosts: RedditPost[] = [
  {
    id: "1",
    title: "First post about something interesting",
    score: 1234,
    numComments: 89,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    url: "https://reddit.com/r/test/1",
  },
  {
    id: "2",
    title: "Another interesting post",
    score: 567,
    numComments: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    url: "https://reddit.com/r/test/2",
  },
];

const mockThemes: Theme[] = [
  {
    id: "1",
    name: "Solution Requests",
    description: "Posts where users are seeking solutions to problems",
    postCount: 15,
    posts: [
      {
        title: "How do I solve this issue?",
        url: "https://reddit.com/r/test/1",
      },
      {
        title: "Need help with this problem",
        url: "https://reddit.com/r/test/2",
      },
    ],
  },
  {
    id: "2",
    name: "Pain & Anger",
    description: "Posts expressing frustration or negative emotions",
    postCount: 8,
    posts: [
      {
        title: "This is so frustrating!",
        url: "https://reddit.com/r/test/3",
      },
    ],
  },
];

export default function SubredditPage({ params }: PageProps) {
  const { subreddit } = use(params);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPosts = await getSubredditPosts(subreddit);
        setPosts(fetchedPosts);
      } catch (err) {
        setError("Failed to load posts. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [subreddit]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 p-8 text-center text-red-800">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No posts found in the last 24 hours.
            </div>
          ) : (
            <PostsTable posts={posts} />
          )}
        </TabsContent>
        <TabsContent value="themes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onViewPosts={(theme) => setSelectedTheme(theme)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedTheme} onOpenChange={() => setSelectedTheme(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedTheme?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {selectedTheme?.posts.map((post, index) => (
              <div key={index}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {post.title}
                </a>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 