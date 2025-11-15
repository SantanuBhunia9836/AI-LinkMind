import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for Android app
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'LinkSaver API is healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
