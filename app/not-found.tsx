import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          404 - Subreddit Not Found
        </h1>
        <p className="text-gray-400">
          The subreddit you're looking for doesn't exist or couldn't be accessed.
        </p>
        <Link href="/">
          <Button
            variant="outline"
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-none"
          >
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 