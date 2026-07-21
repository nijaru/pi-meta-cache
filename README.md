# pi-meta-cache

> **No longer needed for typical use — switch to Responses API.**

Pi's `openai-responses` path now handles Meta correctly zero-config:

- **Thinking**: Meta Chat Completions redacts `reasoning_content` for external keys by design
  (https://dev.meta.ai/docs/features/reasoning). Responses API returns
  `reasoning.summary` deltas which Pi maps to proper thinking blocks.
- **Caching**: `openai-responses` always sends `sessionId` as `prompt_cache_key`
  when caching is enabled, unlike `openai-completions` which only whitelisted
  `api.openai.com`. Live test: `cached_tokens` 0 -> 2339 with key (93% hit), 0 without.

**Fix** — in your `~/.pi/agent/models.json` or dotfiles source `dot_pi/agent/models.json`:

```json
"meta": {
  "baseUrl": "https://api.meta.ai/v1",
  "apiKey": "$META_API_KEY",
  "api": "openai-responses",
  "models": [
    {
      "id": "muse-spark-1.1",
      "name": "Muse Spark 1.1",
      "reasoning": true,
      "input": ["text"],
      "contextWindow": 262144
    }
  ]
}
```

No extension needed — works like OpenAI/OpenRouter now.

This extension is only useful if you must stay on `openai-completions`.

---

## Legacy behavior (completions)

Original purpose: inject stable `prompt_cache_key` into `meta` requests so repeated
prefixes route to backend holding cached prefix.

Cache hits require exact, large, unchanged prompt prefix.

### Installation

```bash
pi install git:github.com/nijaru/pi-meta-cache
```

### Configuration

| Value | Behavior |
|---|---|
| `shared` | _Default._ Fixed key (`pi-meta`) across sessions. |
| `session` | Key per Pi session (`pi-meta-<sessionId>`). |
| `<literal>` | Custom key. |
| `off` | Disable injection. |

### Verify

Inspect `usage.prompt_tokens_details.cached_tokens` / `input_tokens_details.cached_tokens`.

MIT
