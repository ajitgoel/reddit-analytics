"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { use } from "react";

interface PageProps {
  params: Promise<{ subreddit: string }>;
}

export default function SubredditPage({ params }: PageProps) {
  const { subreddit } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.includes("/themes") ? "themes" : "posts";

  const handleTabChange = (value: string) => {
    if (value === "themes") {
      router.push(`/${subreddit}/themes`);
    } else {
      router.push(`/${subreddit}`);
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="posts">Top Posts</TabsTrigger>
        <TabsTrigger value="themes">Themes</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="space-y-4">
        <div className="rounded-lg border p-8 text-center">
          Top Posts content coming soon...
        </div>
      </TabsContent>
      <TabsContent value="themes" className="space-y-4">
        <div className="rounded-lg border p-8 text-center">
          Themes analysis coming soon...
        </div>
      </TabsContent>
    </Tabs>
  );
} 