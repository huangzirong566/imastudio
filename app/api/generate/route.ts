import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.HF_TOKEN) {
      console.error("❌ HF_TOKEN is missing");
      return NextResponse.json({ error: 'Server configuration error: HF_TOKEN is missing' }, { status: 500 });
    }

    console.log(`🚀 Sending request to Hugging Face for prompt: "${prompt.substring(0, 20)}..."`);

    // ✅ 使用新的 Router URL
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Hugging Face API error:', errorText);
      return NextResponse.json(
        { error: `Hugging Face API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
