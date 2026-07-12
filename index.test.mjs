import { expect, test } from "bun:test";
import extension from "./index.ts";

function setup(flag) {
	const flags = new Map();
	const handlers = new Map();
	const pi = {
		registerFlag(name) {
			flags.set(name, undefined);
		},
		getFlag(name) {
			return name === "meta-cache-key" ? flag : flags.get(name);
		},
		on(name, handler) {
			handlers.set(name, handler);
		},
	};

	extension(pi);
	return handlers.get("before_provider_request");
}

const context = (provider = "meta") => ({
	model: { provider },
	sessionManager: { getSessionId: () => "session-1" },
});

const event = (payload = { model: "muse-spark-1.1" }) => ({
	type: "before_provider_request",
	payload,
});

test("injects the shared key by default", async () => {
	const handler = setup();
	const result = await handler(event(), context());
	expect(result.prompt_cache_key).toBe("pi-meta");
});

test("supports session and literal keys", async () => {
	expect((await setup("session")(event(), context())).prompt_cache_key).toBe("pi-meta-session-1");
	expect((await setup("my-app")(event(), context())).prompt_cache_key).toBe("my-app");
});

test("does not inject when disabled or for other providers", async () => {
	expect(await setup("off")(event(), context())).toBeUndefined();
	expect(await setup()(event(), context("xai-auth"))).toBeUndefined();
});

test("preserves an existing key", async () => {
	const handler = setup();
	const result = await handler(event({ prompt_cache_key: "caller-key" }), context());
	expect(result).toBeUndefined();
});
