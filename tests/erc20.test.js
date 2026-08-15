import assert from "node:assert/strict";
import test from "node:test";

import {
  ERC20_CALLS,
  decodeStringResult,
  decodeUint8,
  encodeBalanceOf,
  formatTokenBalance,
} from "../src/erc20.js";

const ADDRESS = "0x1234567890abcdef1234567890ABCDEF12345678";

test("encodes ERC20 balanceOf calls", () => {
  assert.equal(
    encodeBalanceOf(ADDRESS),
    `${ERC20_CALLS.balanceOf}0000000000000000000000001234567890abcdef1234567890abcdef12345678`,
  );
  assert.equal(encodeBalanceOf("0x1234"), null);
});

test("decodes ERC20 uint8 values", () => {
  assert.equal(decodeUint8("0x12"), 18);
  assert.equal(decodeUint8("bad"), null);
});

test("decodes dynamic and bytes32 string results", () => {
  const symbol = "0x0000000000000000000000000000000000000000000000000000000000000020" +
    "0000000000000000000000000000000000000000000000000000000000000004" +
    "5553444300000000000000000000000000000000000000000000000000000000";
  const bytes32 = "0x4441490000000000000000000000000000000000000000000000000000000000";

  assert.equal(decodeStringResult(symbol), "USDC");
  assert.equal(decodeStringResult(bytes32), "DAI");
});

test("formats token balances with decimals", () => {
  assert.equal(formatTokenBalance("0x0", 6, "USDC"), "0 USDC");
  assert.equal(formatTokenBalance("0xf4240", 6, "USDC"), "1 USDC");
  assert.equal(formatTokenBalance("0x7b", 0, "POINTS"), "123 POINTS");
  assert.equal(formatTokenBalance("bad", 18, "TOKEN"), "-");
});
