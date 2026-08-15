const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function isValidEvmAddress(value) {
  return typeof value === "string" && EVM_ADDRESS_PATTERN.test(value);
}

export function formatAddress(value) {
  if (!isValidEvmAddress(value)) {
    return "-";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
