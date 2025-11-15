import { NextResponse } from 'next/server';
import { categorizeLinkAction } from '@/app/actions';
import { z } from 'zod';

const categorizeSchema = z.object({
  url: z.string().url('Invalid URL'),
});

/**
 * POST /api/categorize
 * Categorize a video link using AI
 * 
 * Request body:
 * {
 *   "url": "https://www.youtube.com/watch?v=..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "title": "...",
 *     "description": "...",
 *     "category": "...",
 *     "confidence": 0.95,
 *     "creatorName": "...",
 *     "thumbnailUrl": "..."
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const validation = categorizeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request. Please provide a valid URL.',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Call the AI categorization action
    const result = await categorizeLinkAction(url);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to categorize link';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
