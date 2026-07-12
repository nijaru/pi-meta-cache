// Provider-specific prefix-cache helpers.
//
// xAI/Grok uses the `x-grok-conv-id` HTTP header to improve routing to the
// server holding a reusable prompt prefix. Meta's Model API accepts the
// `prompt_cache_key` request field for the same purpose. Both providers still
// require exact, sufficiently large, unchanged prefixes for cache hits.

import type {
	BeforeProviderHeadersEvent,
	BeforeProviderRequestEvent,
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";

const XAI_PROVIDERS = new Set(["xai", "xai-auth"]);
const META_PROVIDERS = new Set(["meta"]);
const GROK_HEADER = "x-grok-conv-id";
const META_FIELD = "prompt_cache_key";
const GROK_FLAG = "grok-cache-key";
const META_FLAG = "meta-cache-key";

type CacheStrategy = "session" | "shared" | "off" | string;

export default function (pi: ExtensionAPI) {
	pi.registerFlag(GROK_FLAG, {
		description:
			"x-grok-conv-id value for Grok prefix caching: 'session' (default, per-session), a custom literal, or 'off' to disable.",
		type: "string",
	});
	pi.registerFlag(META_FLAG, {
		description:
			"prompt_cache_key value for Meta prefix caching: 'shared' (default), a custom literal, or 'off' to disable.",
		type: "string",
	});

	const readStrategy = (name: string, fallback: CacheStrategy): CacheStrategy => {
		const value = pi.getFlag(name);
		return typeof value === "string" && value.length > 0 ? value : fallback;
	};

	const resolveKey = (
		strategy: CacheStrategy,
		ctx: ExtensionContext,
		sharedKey: string,
		sessionPrefix: string,
	): string | undefined => {
		if (strategy === "off" || strategy === "disabled" || strategy === "none") return undefined;
		if (strategy === "session") return `${sessionPrefix}-${ctx.sessionManager.getSessionId()}`;
		if (strategy === "shared") return sharedKey;
		return strategy;
	};

	pi.on("before_provider_headers", (event: BeforeProviderHeadersEvent, ctx) => {
		if (!ctx.model || !XAI_PROVIDERS.has(ctx.model.provider)) return;

		const key = resolveKey(readStrategy(GROK_FLAG, "session"), ctx, "pi-grok", "pi-grok");
		if (key) event.headers[GROK_HEADER] = key;
	});

	pi.on("before_provider_request", (event: BeforeProviderRequestEvent, ctx) => {
		if (!ctx.model || !META_PROVIDERS.has(ctx.model.provider)) return;

		const key = resolveKey(readStrategy(META_FLAG, "shared"), ctx, "pi-meta", "pi-meta");
		if (!key || !isRecord(event.payload) || event.payload[META_FIELD] !== undefined) return;

		return { ...event.payload, [META_FIELD]: key };
	});
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
