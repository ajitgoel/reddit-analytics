import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export interface Theme {
  id: string;
  name: string;
  description: string;
  postCount: number;
  posts: {
    title: string;
    url: string;
  }[];
}

interface ThemeCardProps {
  theme: Theme;
  onViewPosts: (theme: Theme) => void;
}

export function ThemeCard({ theme, onViewPosts }: ThemeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{theme.name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {theme.postCount} posts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{theme.description}</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewPosts(theme)}
        >
          View Posts
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
} 