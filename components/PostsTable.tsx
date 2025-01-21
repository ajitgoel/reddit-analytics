"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpIcon, MessageSquare, ChevronDown, ArrowDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_IDS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RedditPostData } from "@/services/subreddit/types"

export interface RedditPost {
  id: string
  title: string
  score: number
  num_comments: number
  created_utc: Date
  url: string
  post_categories?: {
    category_id: string
    is_relevant: boolean
  }[]
}

interface PostsTableProps {
  posts: RedditPostData[]
}

type SortField = "score" | "num_comments" | "created_utc"
type SortOrder = "asc" | "desc"

const ITEMS_PER_PAGE = 10

export function PostsTable({ posts }: PostsTableProps) {
  const [sortField, setSortField] = useState<SortField>("score")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [page, setPage] = useState(1)

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const modifier = sortOrder === "asc" ? 1 : -1
    if (sortField === "created_utc") {
      return (new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()) * modifier
    }
    return (a[sortField] - b[sortField]) * modifier
  })

  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = sortedPosts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <Card className="bg-gray-900 text-white border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Reddit Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-between bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                >
                  Sort by: {sortField}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
                <DropdownMenuItem onClick={() => handleSort("score")} className="hover:bg-gray-700">
                  Upvotes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("num_comments")} className="hover:bg-gray-700">
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("created_utc")} className="hover:bg-gray-700">
                  Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 hover:bg-gray-800">
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="w-[100px] text-gray-300">
                    <Button variant="ghost" onClick={() => handleSort("score")} className="hover:bg-gray-700">
                      <ArrowUpIcon className="h-4 w-4 inline-block mr-1" />
                      Votes
                      {sortField === "score" &&
                        (sortOrder === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4 inline-block ml-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 inline-block ml-1" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] text-gray-300">
                    <Button variant="ghost" onClick={() => handleSort("num_comments")} className="hover:bg-gray-700">
                      <MessageSquare className="h-4 w-4 inline-block mr-1" />
                      Comments
                      {sortField === "num_comments" &&
                        (sortOrder === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4 inline-block ml-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 inline-block ml-1" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px] text-gray-300">
                    <Button variant="ghost" onClick={() => handleSort("created_utc")} className="hover:bg-gray-700">
                      Posted
                      {sortField === "created_utc" &&
                        (sortOrder === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4 inline-block ml-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 inline-block ml-1" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">Categories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <TableRow key={post.reddit_post_id} className="hover:bg-gray-800">
                    <TableCell className="font-medium">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {post.title}
                      </a>
                    </TableCell>
                    <TableCell className="text-gray-300">{(post.score || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-300">{(post.num_comments || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-300">
                      {formatDistanceToNow(new Date(post.created_utc), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.post_categories
                          ?.filter((cat) => cat.is_relevant)
                          .map((category) => (
                            <Badge
                              key={`${post.reddit_post_id}-${category.category_id}`}
                              variant="secondary"
                              className="bg-gray-700 text-gray-200"
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
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="flex items-center text-gray-300">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get category name from ID
function getCategoryName(categoryId: string): string {
  const categoryMap = {
    [CATEGORY_IDS.SOLUTION_REQUEST]: "Solution Request",
    [CATEGORY_IDS.PAIN_POINT]: "Pain Point",
    [CATEGORY_IDS.FEATURE_REQUEST]: "Feature Request",
    [CATEGORY_IDS.BUG_REPORT]: "Bug Report",
    [CATEGORY_IDS.SUCCESS_STORY]: "Success Story",
  }
  return categoryMap[categoryId as keyof typeof categoryMap] || "Unknown"
}

