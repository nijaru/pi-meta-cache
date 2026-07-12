# pi-meta-cache

Pi extension for Meta Model API prefix-cache routing.

## What it does

Meta caches matching prefixes automatically. This extension injects a stable
`prompt_cache_key` into `meta` requests so repeated prefixes are more likely to
route to the backend holding the cached prefix.

Cache hits still require an exact, sufficiently large, unchanged prompt prefix,
and cache eviction can produce misses.

## Installation

```bash
pi install git:github.com/nijaru/pi-meta-cache
```

Restart Pi after installing.

## Configuration

Use `--meta-cache-key` to choose the routing key:

| Value | Behavior |
|---|---|
| `shared` | _Default._ Fixed key (`pi-meta`) across sessions. |
| `session` | Key per Pi session (`pi-meta-<sessionId>`). |
| `<literal>` | Custom key. |
| `off` | Disable injection. |

The extension does not overwrite an explicitly supplied `prompt_cache_key`.

## Verify

Inspect `usage.prompt_tokens_details.cached_tokens` in provider responses after
repeating a prompt with a large, unchanged prefix. The first request normally
has zero cached tokens; later requests should report a positive value when the
cache is hit.

## License

MIT
