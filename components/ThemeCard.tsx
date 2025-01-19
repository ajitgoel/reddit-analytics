import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export interface Theme {
  id: string;
  name: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral";
  keywords: string[];
  postCount: number;
  posts: {
    title: string;
    url: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
}

interface ThemeCardProps {
  theme: Theme;
  onViewPosts: (theme: Theme) => void;
}

const sentimentColors = {
  positive: "bg-green-100 text-green-800",
  negative: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-800"
};

export function ThemeCard({ theme, onViewPosts }: ThemeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{theme.name}</span>
          <Badge variant="outline" className={sentimentColors[theme.sentiment]}>
            {theme.sentiment}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{theme.description}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {theme.keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {theme.postCount} posts
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onViewPosts(theme)}
          >
            View Posts
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 