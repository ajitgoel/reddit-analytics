import { NextResponse } from 'next/server';
import { categoryService } from '@/services/category/categoryService';

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const category = await categoryService.addCategory(name, description);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await categoryService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 