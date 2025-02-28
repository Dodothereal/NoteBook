/**
 * Claude API service for interacting with Claude 3.5 and 3.7 models
 */

// API route for Claude
const API_ROUTE = '/api/claude';

// Claude model identifiers
export const CLAUDE_MODELS = {
    CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20240620',
    CLAUDE_3_7_SONNET: 'claude-3-7-sonnet-20240307',
};

/**
 * Sends a message to Claude API and returns the response
 *
 * @param {string} prompt - The user's message
 * @param {string} modelId - The Claude model to use
 * @param {Array} messages - Previous messages in the conversation
 * @param {Array} files - Files to include in the message context
 * @param {boolean} extendedThinking - Whether to enable extended thinking (Claude 3.7 only)
 * @returns {Promise} - Promise containing Claude's response
 */
export async function sendMessageToClaude(prompt, modelId, messages = [], files = [], extendedThinking = false) {
    try {
        // Construct request payload
        const payload = {
            model: modelId,
            messages: [...messages, { role: 'user', content: prompt }],
            max_tokens: 4096,
            extended_thinking: extendedThinking && modelId === CLAUDE_MODELS.CLAUDE_3_7_SONNET,
        };

        // Add files to payload if any are provided
        if (files.length > 0) {
            payload.attachments = files;
        }

        // Send request to our API route
        const response = await fetch(API_ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;

    } catch (error) {
        console.error('Error sending message to Claude:', error);
        throw error;
    }
}

/**
 * Stream a response from Claude API
 *
 * @param {string} prompt - The user's message
 * @param {string} modelId - The Claude model to use
 * @param {Array} messages - Previous messages in the conversation
 * @param {Array} files - Files to include in the message context
 * @param {boolean} extendedThinking - Whether to enable extended thinking (Claude 3.7 only)
 * @param {Function} onChunk - Callback for each chunk of the streamed response
 * @returns {Promise} - Promise that resolves when the stream is complete
 */
export async function streamResponseFromClaude(prompt, modelId, messages = [], files = [], extendedThinking = false, onChunk) {
    try {
        // Construct request payload
        const payload = {
            model: modelId,
            messages: [...messages, { role: 'user', content: prompt }],
            max_tokens: 4096,
            stream: true,
            extended_thinking: extendedThinking && modelId === CLAUDE_MODELS.CLAUDE_3_7_SONNET,
        };

        // Add files to payload if any are provided
        if (files.length > 0) {
            payload.attachments = files;
        }

        // Send request to our API route
        const response = await fetch(API_ROUTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Claude API error: ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.error?.message) {
                    errorMessage = `Claude API error: ${errorData.error.message}`;
                }
            } catch (e) {
                // If parsing fails, use the error text
                errorMessage = `Claude API error: ${errorText || response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        // Setup streaming response handling
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // Validate that we're getting a streaming response
        if (!response.headers.get('content-type')?.includes('text/event-stream')) {
            throw new Error('API did not return a streaming response');
        }

        // Process the stream
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process buffer for complete events
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.type === 'content_block_delta' && parsed.delta.text) {
                            onChunk(parsed.delta.text);
                        }
                    } catch (e) {
                        console.error('Error parsing stream data:', e);
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error streaming response from Claude:', error);

        // Handle the streaming error
        await handleStreamingError(error.message, onChunk);

        throw error;
    }
}

/**
 * Handle connection errors when streaming fails
 *
 * @param {string} error - The error message
 * @param {Function} onChunk - Callback for each chunk
 */
async function handleStreamingError(error, onChunk) {
    const errorMessage = `Error connecting to Claude API: ${error}. Please check your API key and try again.`;
    onChunk(errorMessage);
}