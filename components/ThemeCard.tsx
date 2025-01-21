"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Smile, Frown, HelpCircle, Lightbulb, Bug, Trophy } from "lucide-react"

export interface Theme {
  id: string
  name: string
  description: string
  postCount: number
  posts: {
    title: string
    url: string
  }[]
}

interface ThemeCardProps {
  theme: Theme
  onViewPosts?: () => void
}

const themeConfig = {
  'solution-requests': {
    icon: HelpCircle,
    color: 'text-blue-500',
  },
  'pain-points': {
    icon: Frown,
    color: 'text-red-500',
  },
  'feature-requests': {
    icon: Lightbulb,
    color: 'text-yellow-500',
  },
  'bug-reports': {
    icon: Bug,
    color: 'text-orange-500',
  },
  'success-stories': {
    icon: Trophy,
    color: 'text-green-500',
  },
} as const;

export function ThemeCard({ theme, onViewPosts }: ThemeCardProps) {
  const config = themeConfig[theme.id as keyof typeof themeConfig] || {
    icon: MessageSquare,
    color: 'text-gray-500'
  };

  return (
    <Card className="bg-gray-900 text-white border-gray-800 hover:border-gray-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <config.icon className={`h-5 w-5 ${config.color}`} />
          {theme.name}
        </CardTitle>
        <Badge variant="secondary" className="bg-gray-800">
          {theme.postCount} posts
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 mb-4">{theme.description}</p>
        <div className="space-y-2">
          {theme.posts.slice(0, 3).map((post, index) => (
            <a
              key={index}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              {post.title}
            </a>
          ))}
          {theme.posts.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewPosts}
              className="text-gray-400 hover:text-white"
            >
              View {theme.posts.length - 3} more posts...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

