"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Theme } from "@/components/ThemeCard";
import { ArrowUpRight } from "lucide-react";

interface ThemeSidePanelProps {
  theme: Theme | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSidePanel({ theme, isOpen, onClose }: ThemeSidePanelProps) {
  if (!theme) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900 border-gray-800 text-white">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold text-white">
            {theme.name}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {theme.description}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-4 mt-4">
            {theme.posts.map((post, index) => (
              <a
                key={index}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-blue-400 group-hover:text-blue-300">
                    {post.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-gray-400 flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
} 