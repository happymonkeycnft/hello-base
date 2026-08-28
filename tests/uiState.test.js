import assert from "node:assert/strict";
import test from "node:test";

import {
  canRefreshBalance,
  canRefreshBlock,
  canRefreshToken,
  formatLastUpdated,
  getActionLabel,
  getWalletStatusText,
  hasPendingRequest,
} from "../src/uiState.js";

const baseNetwork = { chainId: "0x2105", name: "Base" };

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

test("guards balance refresh actions", () => {
  assert.equal(canRefreshBalance({ account: "0x1234" }, baseNetwork), true);
  assert.equal(canRefreshBalance({ account: "0x1234", isLoadingBalance: true }, baseNetwork), false);
  assert.equal(canRefreshBalance({ account: "0x1234", isConnecting: true }, baseNetwork), false);
  assert.equal(canRefreshBalance({ account: "0x1234" }, null), false);
  assert.equal(canRefreshBalance({}, baseNetwork), false);
});

test("guards latest block refresh actions", () => {
  assert.equal(canRefreshBlock({}, baseNetwork), true);
  assert.equal(canRefreshBlock({ isLoadingBlock: true }, baseNetwork), false);
  assert.equal(canRefreshBlock({}, null), false);
});

test("guards token refresh actions", () => {
  assert.equal(canRefreshToken({ account: "0x1234" }, baseNetwork, true), true);
  assert.equal(canRefreshToken({ account: "0x1234", isLoadingToken: true }, baseNetwork, true), false);
  assert.equal(canRefreshToken({ account: "0x1234", isConnecting: true }, baseNetwork, true), false);
  assert.equal(canRefreshToken({ account: "0x1234" }, baseNetwork, false), false);
  assert.equal(canRefreshToken({}, baseNetwork, true), false);
});

test("returns action labels for idle and pending states", () => {
  assert.equal(getActionLabel(false, "Refresh ETH", "Refreshing ETH..."), "Refresh ETH");
  assert.equal(getActionLabel(true, "Refresh ETH", "Refreshing ETH..."), "Refreshing ETH...");
});

test("formats empty and populated last-updated timestamps", () => {
  assert.equal(formatLastUpdated(null), "Never");
  assert.match(formatLastUpdated("2026-08-15T08:00:00Z"), /\d/);
});
