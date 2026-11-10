import { getCsrfToken } from './client';

/**
 * Consumes the Server-Sent Events stream from POST /api/v1/query/stream
 * using native fetch and ReadableStreamDefaultReader.
 *
 * @param {Object} payload - { query, session_id, scope, top_k }
 * @param {Object} handlers - { onStage, onToken, onFinal, onError }
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 */
export async function streamQuery(payload, handlers = {}, signal = null) {
  const { onStage, onToken, onFinal, onError } = handlers;
  const csrfToken = await getCsrfToken();

  try {
    const response = await fetch('/api/v1/query/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      body: JSON.stringify(payload),
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      let errBody = {};
      try {
        errBody = await response.json();
      } catch (_) {}
      throw new Error(errBody?.error?.message || `Streaming request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || ''; // Keep incomplete trailing fragment in buffer

      for (const part of parts) {
        if (!part.trim()) continue;

        let eventType = 'message';
        let dataStr = '';

        const lines = part.split('\n');
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            dataStr = line.substring(6).trim();
          }
        }

        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (eventType === 'stage' && onStage) {
            onStage(parsed);
          } else if (eventType === 'token' && onToken) {
            onToken(parsed.delta || '');
          } else if (eventType === 'final' && onFinal) {
            onFinal(parsed);
          } else if (eventType === 'error') {
            if (onError) onError(new Error(parsed.error || 'Server stream error'));
          }
        } catch (jsonErr) {
          console.warn('Could not parse SSE JSON payload:', dataStr, jsonErr);
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream query aborted by user.');
      return;
    }
    if (onError) onError(err);
    else throw err;
  }
}

