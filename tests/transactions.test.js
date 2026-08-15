import assert from "node:assert/strict";
import test from "node:test";

import {
  formatTransactionValue,
  getExplorerTransactionUrl,
  getReceiptStatus,
  isValidTransactionHash,
  normalizeTransactionHash,
} from "../src/transactions.js";

const VALID_HASH = `0x${"a".repeat(64)}`;

test("validates transaction hash format", () => {
  assert.equal(isValidTransactionHash(VALID_HASH), true);
  assert.equal(isValidTransactionHash(`0x${"g".repeat(64)}`), false);
  assert.equal(isValidTransactionHash(`0x${"a".repeat(63)}`), false);
  assert.equal(isValidTransactionHash(null), false);
});

test("normalizes transaction hash input", () => {
  assert.equal(normalizeTransactionHash(` ${VALID_HASH}\n`), VALID_HASH);
  assert.equal(normalizeTransactionHash(undefined), "");
});

test("builds Base explorer transaction links", () => {
  assert.equal(
    getExplorerTransactionUrl("0x2105", VALID_HASH),
    `https://basescan.org/tx/${VALID_HASH}`,
  );
  assert.equal(getExplorerTransactionUrl("0x1", VALID_HASH), null);
});

test("derives transaction receipt status", () => {
  assert.equal(getReceiptStatus(null), "Pending");
  assert.equal(getReceiptStatus({ status: "0x1" }), "Success");
  assert.equal(getReceiptStatus({ status: "0x0" }), "Failed");
  assert.equal(getReceiptStatus({ status: "0x2" }), "Unknown");
});

test("formats transaction value", () => {
  assert.equal(formatTransactionValue({ value: "0xde0b6b3a7640000" }), "1 ETH");
  assert.equal(formatTransactionValue({}), "-");
});
