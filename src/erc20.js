import { isValidEvmAddress } from "./address.js";

export const ERC20_CALLS = {
  balanceOf: "0x70a08231",
  decimals: "0x313ce567",
  name: "0x06fdde03",
  symbol: "0x95d89b41",
};

export function encodeBalanceOf(address) {
  if (!isValidEvmAddress(address)) {
    return null;
  }

  return `${ERC20_CALLS.balanceOf}${address.slice(2).toLowerCase().padStart(64, "0")}`;
}

export function decodeUint256(hexValue) {
  if (typeof hexValue !== "string" || !/^0x[a-fA-F0-9]+$/.test(hexValue)) {
    return null;
  }

  return BigInt(hexValue);
}

export function decodeUint8(hexValue) {
  const value = decodeUint256(hexValue);
  return value === null ? null : Number(value);
}

export function decodeStringResult(hexValue) {
  if (typeof hexValue !== "string" || !hexValue.startsWith("0x")) {
    return null;
  }

  const hex = hexValue.slice(2);
  if (hex.length === 64) {
    return decodeBytes32String(hex);
  }

  if (hex.length < 128) {
    return null;
  }

  const length = Number.parseInt(hex.slice(64, 128), 16);
  const data = hex.slice(128, 128 + length * 2);
  return decodeHexUtf8(data);
}

export function formatTokenBalance(rawBalance, decimals, symbol = "TOKEN") {
  const balance = typeof rawBalance === "bigint" ? rawBalance : decodeUint256(rawBalance);
  if (balance === null || !Number.isInteger(decimals) || decimals < 0) {
    return "-";
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;
  const fractionText = decimals === 0 ? "" : fraction.toString().padStart(decimals, "0");
  const trimmedFraction = fractionText.slice(0, 6).replace(/0+$/, "");
  const amount = trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString();

  return `${amount} ${symbol}`;
}

function decodeBytes32String(hex) {
  const trimmed = hex.replace(/(00)+$/, "");
  return decodeHexUtf8(trimmed);
}

function decodeHexUtf8(hex) {
  try {
    const bytes = Uint8Array.from(hex.match(/.{1,2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
    return new TextDecoder().decode(bytes).replace(/\0/g, "") || null;
  } catch {
    return null;
  }
}
