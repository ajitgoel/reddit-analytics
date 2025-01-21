import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Users, ArrowUpRight } from "lucide-react"

interface SubredditCardProps {
  name: string
  description: string
  memberCount?: number
}

export function SubredditCard({ name, description, memberCount }: SubredditCardProps) {
  return (
    <Link href={`/${name}`} className="block transition-transform hover:scale-105">
      <Card className="h-full overflow-hidden bg-gray-900 border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 pb-8">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            r/{name}
            <ArrowUpRight className="w-5 h-5 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 -mt-6 bg-gray-900 rounded-t-xl relative z-10">
          <CardDescription className="text-gray-300">{description}</CardDescription>
          {memberCount && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>{memberCount.toLocaleString()} members</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

