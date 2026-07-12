// Provider cache fixes.
//
// xAI/Grok — injects the `x-grok-conv-id` HTTP header for prefix-cache routing.
// Grok's prompt caching works but needs a stable conversation id so the backend
// can route to a cached prefix. Without it, `cached_tokens` stays at 0 across
// turns even with identical prefixes. We set one stable per session by default.
// Per https://docs.x.ai/developers/advanced-api-usage/prompt-caching.
//
// The header is injected via the `before_provider_headers` hook, which fires
// after Pi assembles the outgoing headers and before the HTTP call. Handlers
// mutate `event.headers` in place.

import type {
	BeforeProviderHeadersEvent,
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";

const XAI_PROVIDERS = new Set(["xai", "xai-auth"]);
const HEADER = "x-grok-conv-id";
const FLAG = "grok-cache-key";

export default function (pi: ExtensionAPI) {
	pi.registerFlag(FLAG, {
		description:
			"x-grok-conv-id value for Grok prefix caching: 'session' (default, per-session), a custom literal, or 'off' to disable.",
		type: "string",
	});

	const resolveKey = (ctx: ExtensionContext): string | undefined => {
		const strategy = (pi.getFlag(FLAG) as string | undefined) ?? "session";
		if (strategy === "off" || strategy === "disabled" || strategy === "none") return undefined;
		if (strategy === "session") return `pi-grok-${ctx.sessionManager.getSessionId()}`;
		return strategy; // custom literal key
	};

	pi.on("before_provider_headers", (event: BeforeProviderHeadersEvent, ctx) => {
		if (!ctx.model || !XAI_PROVIDERS.has(ctx.model.provider)) return;

		const key = resolveKey(ctx);
		if (key) event.headers[HEADER] = key;
	});
}
