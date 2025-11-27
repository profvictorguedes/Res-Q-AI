import { NextRequest, NextResponse } from 'next/server';
import { analyzeDispatch, analyzeDispatchWithAzureAI } from '@/services/dispatchAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dispatchText, useAzureAI } = body;

    if (!dispatchText || typeof dispatchText !== 'string') {
      return NextResponse.json(
        { error: 'dispatchText is required and must be a string' },
        { status: 400 }
      );
    }

    if (dispatchText.length > 5000) {
      return NextResponse.json(
        { error: 'dispatchText must be less than 5000 characters' },
        { status: 400 }
      );
    }

    let analysis;

    if (useAzureAI && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
      analysis = await analyzeDispatchWithAzureAI(dispatchText, {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      });
    } else {
      analysis = await analyzeDispatch(dispatchText);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing dispatch:', error);
    return NextResponse.json(
      { error: 'Failed to analyze dispatch' },
      { status: 500 }
    );
  }
}
