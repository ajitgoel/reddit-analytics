import { redirect } from "next/navigation";
import { use } from "react";

interface PageProps {
  params: Promise<{ subreddit: string }>;
}

export default function ThemesPage({ params }: PageProps) {
  const { subreddit } = use(params);
  redirect(`/${subreddit}?tab=themes`);
} 