import assert from "node:assert/strict";
import test from "node:test";

import { getProviderErrorMessage } from "../src/providerErrors.js";

test("maps common wallet provider error codes", () => {
  assert.equal(getProviderErrorMessage({ code: 4001 }), "Wallet request rejected");
  assert.equal(getProviderErrorMessage({ code: 4902 }), "Network is not available in this wallet");
});

test("falls back to provider message or default message", () => {
  assert.equal(getProviderErrorMessage({ message: "RPC unavailable" }), "RPC unavailable");
  assert.equal(getProviderErrorMessage(null, "Try again"), "Try again");
});
