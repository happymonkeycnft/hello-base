import assert from "node:assert/strict";
import test from "node:test";

import { formatAddress, isValidEvmAddress } from "../src/address.js";

test("validates EVM address format", () => {
  assert.equal(isValidEvmAddress("0x0000000000000000000000000000000000000000"), true);
  assert.equal(isValidEvmAddress("0x1234567890abcdef1234567890ABCDEF12345678"), true);
  assert.equal(isValidEvmAddress("1234567890abcdef1234567890ABCDEF12345678"), false);
  assert.equal(isValidEvmAddress("0x1234"), false);
  assert.equal(isValidEvmAddress(null), false);
});

test("formats valid addresses for compact display", () => {
  assert.equal(formatAddress("0x1234567890abcdef1234567890ABCDEF12345678"), "0x1234...5678");
  assert.equal(formatAddress("0x1234"), "-");
});
