import { NextResponse } from 'next/server';
import { subredditService } from '@/services/subreddit/subredditService';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: 'Subreddit name is required' },
        { status: 400 }
      );
    }

    // Add subreddit to database
    await subredditService.addSubreddit(name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding subreddit:', error);
    return NextResponse.json(
      { error: 'Failed to add subreddit' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subreddits = await subredditService.getAllSubreddits();
    return NextResponse.json(subreddits);
  } catch (error) {
    console.error('Error fetching subreddits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subreddits' },
      { status: 500 }
    );
  }
} 