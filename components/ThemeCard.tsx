import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface Theme {
  id: string
  name: string
  description: string
  sentiment: "positive" | "negative" | "neutral"
  keywords: string[]
  postCount: number
  posts: {
    title: string
    url: string
    sentiment: "positive" | "negative" | "neutral"
  }[]
}

interface ThemeCardProps {
  theme: Theme
  onViewPosts: (theme: Theme) => void
}

const sentimentConfig = {
  positive: { color: "bg-green-500 text-white", icon: TrendingUp },
  negative: { color: "bg-red-500 text-white", icon: TrendingDown },
  neutral: { color: "bg-gray-500 text-white", icon: Minus },
}

export function ThemeCard({ theme, onViewPosts }: ThemeCardProps) {
  const SentimentIcon = sentimentConfig[theme.sentiment].icon

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 pb-8">
        <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
          <span className="truncate mr-2">{theme.name}</span>
          <Badge variant="outline" className={`${sentimentConfig[theme.sentiment].color} border-none`}>
            <SentimentIcon className="w-4 h-4 mr-1" />
            {theme.sentiment}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 -mt-6 bg-gray-900 rounded-t-xl relative z-10">
        <p className="text-gray-300 mb-4 line-clamp-2">{theme.description}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {theme.keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-900 flex justify-between items-center border-t border-gray-800 pt-4">
        <span className="text-sm text-gray-400">{theme.postCount} posts</span>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-purple-600 text-white border-purple-500 hover:bg-purple-700"
          onClick={() => onViewPosts(theme)}
        >
          View Posts
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

