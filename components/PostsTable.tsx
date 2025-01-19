"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpIcon, MessageSquare } from "lucide-react";

export interface RedditPost {
  id: string;
  title: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}

interface PostsTableProps {
  posts: RedditPost[];
}

export function PostsTable({ posts }: PostsTableProps) {
  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
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
              <TableCell>{post.score.toLocaleString()}</TableCell>
              <TableCell>{post.numComments.toLocaleString()}</TableCell>
              <TableCell>
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 