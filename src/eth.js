export function hexWeiToEth(hexWei) {
  if (typeof hexWei !== "string" || !hexWei.startsWith("0x")) {
    return null;
  }

  const wei = BigInt(hexWei);
  const whole = wei / 10n ** 18n;
  const fraction = wei % 10n ** 18n;
  const paddedFraction = fraction.toString().padStart(18, "0").slice(0, 4);
  const trimmedFraction = paddedFraction.replace(/0+$/, "");

  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString();
}

export function formatEthBalance(hexWei) {
  const eth = hexWeiToEth(hexWei);
  return eth === null ? "-" : `${eth} ETH`;
}

export function hexToDecimalString(hexValue) {
  if (typeof hexValue !== "string" || !hexValue.startsWith("0x")) {
    return "-";
  }

  return BigInt(hexValue).toString();
}
