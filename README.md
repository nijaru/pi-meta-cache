# pi-provider-cache

Pi extension that fixes provider-specific prefix caching issues.

## Grok (xAI)

Grok's prefix caching works but requires the `x-grok-conv-id` HTTP header for
consistent backend routing. Without it, `cached_tokens` stays at 0 even with
identical prefixes across turns. This extension injects the header automatically.

See [xAI prompt caching docs](https://docs.x.ai/developers/advanced-api-usage/prompt-caching).

## Installation

```bash
pi install git:github.com/nijaru/pi-provider-cache
```

Restart Pi after installing.

## Configuration

The cache key strategy is configurable via `--grok-cache-key`:

| Value       | Behavior |
|-------------|----------|
| `session`   | _Default._ Key per Pi session (`pi-grok-<sessionId>`). |
| `<literal>` | Custom fixed key (e.g. `pi-grok-agent` for cross-session reuse). |
| `off`       | Disable header injection. |

## Verify

Check `cached_tokens` in xAI API responses after the first turn with Grok.
Should show non-zero cached tokens growing across turns.

## License

MIT
