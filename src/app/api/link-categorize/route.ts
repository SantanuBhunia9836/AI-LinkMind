import { NextResponse } from 'next/server';
import { categorizeLinkAction } from '@/app/actions';

/**
 * POST /api/link-categorize
 * Alternative endpoint for categorizing links
 * Can be called from client-side without server action caching issues
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await categorizeLinkAction(url);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to categorize link';
    console.error('Link categorization error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
