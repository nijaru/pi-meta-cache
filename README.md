# pi-provider-cache

Pi extension for provider-specific prefix-cache routing hints.

## xAI/Grok

Injects the `x-grok-conv-id` HTTP header for `xai` and `xai-auth` requests.
xAI caches matching prefixes automatically; the stable header improves routing to
the server holding the cached prefix.

## Meta Model API

Injects `prompt_cache_key` into `meta` requests. Meta documents caching as
automatic and the key as an optional way to improve hit rates across backends.
The default shared key follows Meta's guidance not to partition by session.

For either provider, cache hits still require an exact, sufficiently large,
unchanged prompt prefix, and cache eviction can produce misses.

## Installation

```bash
pi install git:github.com/nijaru/pi-provider-cache
```

Restart Pi after installing.

## Configuration

### Grok: `--grok-cache-key`

| Value | Behavior |
|---|---|
| `session` | _Default._ Key per Pi session (`pi-grok-<sessionId>`). |
| `shared` | Fixed key (`pi-grok`) for cross-session routing. |
| `<literal>` | Custom key. |
| `off` | Disable extension injection. |

### Meta: `--meta-cache-key`

| Value | Behavior |
|---|---|
| `shared` | _Default._ Fixed key (`pi-meta`) across sessions. |
| `session` | Key per Pi session (`pi-meta-<sessionId>`). |
| `<literal>` | Custom key. |
| `off` | Disable extension injection. |

The extension does not overwrite an explicitly supplied `prompt_cache_key`.

## Verify

Inspect `usage.prompt_tokens_details.cached_tokens` in provider responses after
repeating a prompt with a large, unchanged prefix. The first request normally
has zero cached tokens; later requests should report a positive value when the
cache is hit.

## License

MIT
