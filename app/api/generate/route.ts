import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 从 request body 获取 prompt
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 检查环境变量
    if (!process.env.HF_TOKEN) {
      return NextResponse.json(
        { error: 'HF_TOKEN is not configured' },
        { status: 500 }
      );
    }

    // 调用 Hugging Face Inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
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
      console.error('Hugging Face API error:', errorText);
      return NextResponse.json(
        { error: `Hugging Face API error: ${response.statusText}` },
        { status: 500 }
      );
    }

    // 将返回的二进制流转成 Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 返回 image/jpeg 图片
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
