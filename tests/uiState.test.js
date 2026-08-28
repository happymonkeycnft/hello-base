import assert from "node:assert/strict";
import test from "node:test";

import { formatLastUpdated, getWalletStatusText, hasPendingRequest } from "../src/uiState.js";

test("detects pending dashboard requests", () => {
  assert.equal(hasPendingRequest({}), false);
  assert.equal(hasPendingRequest({ isLoadingBalance: true }), true);
  assert.equal(hasPendingRequest({ pendingSwitchChainId: "0x2105" }), true);
});

test("returns wallet status text by priority", () => {
  assert.equal(getWalletStatusText({ isConnecting: true }), "Connecting...");
  assert.equal(getWalletStatusText({ errorMessage: "Rejected" }), "Rejected");
  assert.equal(getWalletStatusText({ account: "0x1234" }), "Connected");
  assert.equal(getWalletStatusText({}), "Not connected");
});

test("formats empty and populated last-updated timestamps", () => {
  assert.equal(formatLastUpdated(null), "Never");
  assert.match(formatLastUpdated("2026-08-15T08:00:00Z"), /\d/);
});
