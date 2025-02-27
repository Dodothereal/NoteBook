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
        // Format messages for Claude API
        const formattedMessages = formatMessagesForClaude(messages, prompt);

        // Format files for Claude API if any are provided
        const formattedFiles = files.length > 0 ? await formatFilesForClaude(files) : [];

        // Construct request payload
        const payload = {
            model: modelId,
            messages: formattedMessages,
            max_tokens: 4096,
            extended_thinking: extendedThinking && modelId === CLAUDE_MODELS.CLAUDE_3_7_SONNET,
        };

        // Add files to payload if any are provided
        if (formattedFiles.length > 0) {
            payload.attachments = formattedFiles;
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
 * Format conversation messages into Claude API format
 *
 * @param {Array} messages - Previous messages in the conversation
 * @param {string} currentPrompt - The current user prompt
 * @returns {Array} - Formatted messages for Claude API
 */
function formatMessagesForClaude(messages, currentPrompt) {
    const formattedMessages = messages.map(message => ({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.text
    }));

    // Add the current prompt as the last user message
    formattedMessages.push({
        role: 'user',
        content: currentPrompt
    });

    return formattedMessages;
}

/**
 * Format files for Claude API
 *
 * @param {Array} files - Files to include in the message
 * @returns {Array} - Formatted file objects for Claude API
 */
async function formatFilesForClaude(files) {
    const formattedFiles = [];

    for (const file of files) {
        // Convert file to base64
        const base64Content = await fileToBase64(file);

        formattedFiles.push({
            type: 'file',
            file_id: file.id,
            media_type: file.type,
            data: base64Content.split(',')[1] // Remove data URL prefix
        });
    }

    return formattedFiles;
}

/**
 * Convert a file to base64 format
 *
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Promise containing base64 data URL
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
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
        // Format messages for Claude API
        const formattedMessages = formatMessagesForClaude(messages, prompt);

        // Format files for Claude API if any are provided
        const formattedFiles = files.length > 0 ? await formatFilesForClaude(files) : [];

        // Construct request payload
        const payload = {
            model: modelId,
            messages: formattedMessages,
            max_tokens: 4096,
            stream: true,
            extended_thinking: extendedThinking && modelId === CLAUDE_MODELS.CLAUDE_3_7_SONNET,
        };

        // Add files to payload if any are provided
        if (formattedFiles.length > 0) {
            payload.attachments = formattedFiles;
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

        // Setup streaming response handling
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // Read stream chunks
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
        throw error;
    }
}