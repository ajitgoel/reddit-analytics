"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostsTable } from "@/components/PostsTable";
import { ThemeCard } from "@/components/ThemeCard";
import type { RedditPostData } from "@/services/subreddit/types";
import { CATEGORY_IDS } from "@/lib/constants";

interface Theme {
  id: string;
  name: string;
  description: string;
  postCount: number;
  posts: {
    title: string;
    url: string;
  }[];
}

interface SubredditPageContentProps {
  posts: RedditPostData[];
}

export function SubredditPageContent({ posts }: SubredditPageContentProps) {
  const [activeTab, setActiveTab] = useState("posts");

  // Generate themes from posts
  const themes = generateThemes(posts);

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 text-gray-200">
          <TabsTrigger value="posts" className="data-[state=active]:bg-gray-700">
            Top Posts
          </TabsTrigger>
          <TabsTrigger value="themes" className="data-[state=active]:bg-gray-700">
            Themes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-lg border border-gray-800 p-8 text-center text-gray-400">
              No posts found in the last 24 hours.
            </div>
          ) : (
            <PostsTable posts={posts} />
          )}
        </TabsContent>
        <TabsContent value="themes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generateThemes(posts: RedditPostData[]): Theme[] {
  const themes: Theme[] = [
    {
      id: "solution-requests",
      name: "Solution Requests",
      description: "Posts where users are seeking solutions to problems",
      posts: [],
      postCount: 0,
    },
    {
      id: "pain-points",
      name: "Pain Points",
      description: "Posts expressing frustration or problems",
      posts: [],
      postCount: 0,
    },
    {
      id: "feature-requests",
      name: "Feature Requests",
      description: "Posts suggesting new features",
      posts: [],
      postCount: 0,
    },
    {
      id: "bug-reports",
      name: "Bug Reports",
      description: "Posts reporting issues or bugs",
      posts: [],
      postCount: 0,
    },
    {
      id: "success-stories",
      name: "Success Stories",
      description: "Posts sharing positive experiences",
      posts: [],
      postCount: 0,
    },
  ];

  // Group posts by their categories
  posts.forEach((post) => {
    post.post_categories?.forEach((category) => {
      if (!category.is_relevant) return;

      const theme = themes.find((t) => {
        switch (t.id) {
          case "solution-requests":
            return category.category_id === CATEGORY_IDS.SOLUTION_REQUEST;
          case "pain-points":
            return category.category_id === CATEGORY_IDS.PAIN_POINT;
          case "feature-requests":
            return category.category_id === CATEGORY_IDS.FEATURE_REQUEST;
          case "bug-reports":
            return category.category_id === CATEGORY_IDS.BUG_REPORT;
          case "success-stories":
            return category.category_id === CATEGORY_IDS.SUCCESS_STORY;
          default:
            return false;
        }
      });

      if (theme) {
        theme.posts.push({
          title: post.title,
          url: post.url,
        });
        theme.postCount++;
      }
    });
  });

  // Only return themes that have posts
  return themes.filter((theme) => theme.postCount > 0);
} 