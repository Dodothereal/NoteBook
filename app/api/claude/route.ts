// app/api/claude/route.js
import { NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const API_BASE_URL = 'https://api.anthropic.com/v1';

export async function POST(request) {
    try {
        const data = await request.json();
        const { model, messages, attachments, extendedThinking, stream } = data;

        // Validate required fields
        if (!model || !messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid request. Model and messages are required.' },
                { status: 400 }
            );
        }

        // Check if we have API key
        if (!CLAUDE_API_KEY) {
            console.error('Claude API key is not set in .env.local');
            return NextResponse.json(
                { error: 'API key not configured. Please add CLAUDE_API_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        // Create request payload
        const payload = {
            model,
            messages,
            max_tokens: 4096,
        };

        // Add optional parameters if provided
        if (extendedThinking) {
            payload.extended_thinking = extendedThinking;
        }

        if (stream) {
            payload.stream = true;
        }

        // Add attachments to payload if provided
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            payload.attachments = attachments;
        }

        // Make request to Claude API
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(payload)
        });

        // Handle streaming response
        if (stream) {
            // Forward streaming response directly
            const body = response.body;
            return new NextResponse(body, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            });
        }

        // Handle non-streaming response
        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.error?.message || response.statusText },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error calling Claude API:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}