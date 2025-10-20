import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is working. Use POST to send data.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('📤 Webhook data received:', data);

    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('❌ Webhook URL not configured');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    console.log('🔗 Sending to webhook:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Webhook response status:', response.status);

    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Webhook sent successfully:', responseText);
      return NextResponse.json({ success: true, response: responseText });
    } else {
      const errorText = await response.text();
      console.error('❌ Webhook failed:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
