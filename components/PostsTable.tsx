"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpIcon, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_IDS } from "@/lib/constants";

export interface RedditPost {
  id: string;
  title: string;
  score: number;
  num_comments: number;
  created_utc: Date;
  url: string;
  post_categories?: {
    category_id: string;
    is_relevant: boolean;
  }[];
}

interface PostsTableProps {
  posts: RedditPost[];
}

type SortField = "score" | "num_comments" | "created_utc";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export function PostsTable({ posts }: PostsTableProps) {
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);

  const sortedPosts = [...posts].sort((a, b) => {
    const modifier = sortOrder === "asc" ? 1 : -1;
    if (sortField === "created_utc") {
      return (
        (new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()) *
        modifier
      );
    }
    return (a[sortField] - b[sortField]) * modifier;
  });

  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = sortedPosts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              Sort by: {sortField}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSort("score")}>
              Upvotes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("num_comments")}>
              Comments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("created_utc")}>
              Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-[100px]">
                <ArrowUpIcon className="h-4 w-4 inline-block mr-1" />
                Votes
              </TableHead>
              <TableHead className="w-[100px]">
                <MessageSquare className="h-4 w-4 inline-block mr-1" />
                Comments
              </TableHead>
              <TableHead className="w-[150px]">Posted</TableHead>
              <TableHead>Categories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {post.title}
                  </a>
                </TableCell>
                <TableCell>{(post.score || 0).toLocaleString()}</TableCell>
                <TableCell>{(post.num_comments || 0).toLocaleString()}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(post.created_utc), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.post_categories?.filter(cat => cat.is_relevant).map((category) => (
                      <Badge 
                        key={`${post.id}-${category.category_id}`}
                        variant="secondary"
                      >
                        {getCategoryName(category.category_id)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to get category name from ID
function getCategoryName(categoryId: string): string {
  const categoryMap = {
    [CATEGORY_IDS.SOLUTION_REQUEST]: "Solution Request",
    [CATEGORY_IDS.PAIN_POINT]: "Pain Point",
    [CATEGORY_IDS.FEATURE_REQUEST]: "Feature Request",
    [CATEGORY_IDS.BUG_REPORT]: "Bug Report",
    [CATEGORY_IDS.SUCCESS_STORY]: "Success Story",
  };
  return categoryMap[categoryId as keyof typeof categoryMap] || "Unknown";
} 