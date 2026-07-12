// Meta Model API prefix-cache routing helper.
//
// Meta caches matching prefixes automatically. A stable `prompt_cache_key`
// improves routing to the backend holding the cached prefix. This extension
// injects that request-body field without touching provider HTTP headers.

import type {
	BeforeProviderRequestEvent,
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";

const META_PROVIDER = "meta";
const META_FIELD = "prompt_cache_key";
const META_FLAG = "meta-cache-key";

type CacheStrategy = "session" | "shared" | "off" | string;

export default function (pi: ExtensionAPI) {
	pi.registerFlag(META_FLAG, {
		description:
			"prompt_cache_key value for Meta prefix caching: 'shared' (default), a custom literal, or 'off' to disable.",
		type: "string",
	});

	const readStrategy = (): CacheStrategy => {
		const value = pi.getFlag(META_FLAG);
		return typeof value === "string" && value.length > 0 ? value : "shared";
	};

	const resolveKey = (strategy: CacheStrategy, ctx: ExtensionContext): string | undefined => {
		if (strategy === "off" || strategy === "disabled" || strategy === "none") return undefined;
		if (strategy === "session") return `pi-meta-${ctx.sessionManager.getSessionId()}`;
		if (strategy === "shared") return "pi-meta";
		return strategy;
	};

	pi.on("before_provider_request", (event: BeforeProviderRequestEvent, ctx) => {
		if (ctx.model?.provider !== META_PROVIDER) return;

		const key = resolveKey(readStrategy(), ctx);
		if (!key || !isRecord(event.payload) || event.payload[META_FIELD] !== undefined) return;

		return { ...event.payload, [META_FIELD]: key };
	});
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
