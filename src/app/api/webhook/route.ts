// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface for webhook data validation
interface WebhookData {
  student_name: string;
  student_phone: string;
  student_academic_year: string;
  exam_name: string;
  total_score: number;
  student_score: number;
  timestamp: string;
}

// Validate webhook data structure
function validateWebhookData(data: unknown): data is WebhookData {
  return (
    typeof data === 'object' &&
    typeof data.student_name === 'string' &&
    typeof data.student_phone === 'string' &&
    typeof data.student_academic_year === 'string' &&
    typeof data.exam_name === 'string' &&
    typeof data.total_score === 'number' &&
    typeof data.student_score === 'number' &&
    typeof data.timestamp === 'string'
  );
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate data structure
    if (!validateWebhookData(data)) {
      console.error('❌ Invalid webhook data structure:', data);
      return NextResponse.json(
        { success: false, error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Log webhook data for debugging
    console.log('📥 Webhook received:', {
      student: data.student_name,
      exam: data.exam_name,
      score: `${data.student_score}/${data.total_score}`,
      percentage: `${Math.round((data.student_score / data.total_score) * 100)}%`,
      timestamp: data.timestamp,
    });

    // Process webhook data here
    // You can add your webhook logic based on the data received
    // For example: send to external API, save to file, send notification, etc.

    // Simulate processing time (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      processed_at: new Date().toISOString(),
      data_received: {
        student: data.student_name,
        exam: data.exam_name,
        score: `${data.student_score}/${data.total_score}`,
      },
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
