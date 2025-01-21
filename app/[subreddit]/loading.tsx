import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400">Analyzing subreddit posts...</p>
      </div>
    </div>
  );
} 