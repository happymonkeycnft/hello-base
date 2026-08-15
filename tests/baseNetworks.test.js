import assert from "node:assert/strict";
import test from "node:test";

import {
  getBaseNetwork,
  getSupportedBaseNetworks,
  getWalletSwitchParams,
} from "../src/baseNetworks.js";

test("returns Base mainnet and Sepolia configs", () => {
  assert.equal(getBaseNetwork("0x2105").decimalChainId, 8453);
  assert.equal(getBaseNetwork("0x14a34").decimalChainId, 84532);
  assert.equal(getBaseNetwork("0x1"), null);
});

test("builds wallet switch params for supported Base networks", () => {
  const params = getWalletSwitchParams("0x14a34");

  assert.equal(params.chainId, "0x14a34");
  assert.equal(params.chainName, "Base Sepolia");
  assert.deepEqual(params.rpcUrls, ["https://sepolia.base.org"]);
  assert.deepEqual(params.blockExplorerUrls, ["https://sepolia.basescan.org"]);
});

test("lists supported Base networks", () => {
  assert.deepEqual(
    getSupportedBaseNetworks().map((network) => network.chainId),
    ["0x2105", "0x14a34"],
  );
});
