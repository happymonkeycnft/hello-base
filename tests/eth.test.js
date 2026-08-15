import assert from "node:assert/strict";
import test from "node:test";

import { formatEthBalance, hexToDecimalString, hexWeiToEth } from "../src/eth.js";

test("formats wei hex values as ETH", () => {
  assert.equal(hexWeiToEth("0x0"), "0");
  assert.equal(hexWeiToEth("0xde0b6b3a7640000"), "1");
  assert.equal(formatEthBalance("0x2386f26fc10000"), "0.01 ETH");
});

test("handles invalid hex values safely", () => {
  assert.equal(hexWeiToEth("100"), null);
  assert.equal(formatEthBalance(undefined), "-");
  assert.equal(hexToDecimalString("latest"), "-");
});

test("converts hex block numbers to decimal strings", () => {
  assert.equal(hexToDecimalString("0x2105"), "8453");
});
