import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

interface SubredditCardProps {
  name: string;
  description: string;
  memberCount?: number;
}

export function SubredditCard({ name, description, memberCount }: SubredditCardProps) {
  return (
    <Link href={`/${name}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            r/{name}
          </CardTitle>
          <CardDescription>
            {description}
            {memberCount && (
              <span className="block mt-2 text-sm text-muted-foreground">
                {memberCount.toLocaleString()} members
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
} 