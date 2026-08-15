import { getBaseNetwork } from "./baseNetworks.js";
import { formatEthBalance } from "./eth.js";

const TRANSACTION_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;

export function isValidTransactionHash(value) {
  return typeof value === "string" && TRANSACTION_HASH_PATTERN.test(value);
}

export function normalizeTransactionHash(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getExplorerTransactionUrl(chainId, hash) {
  const network = getBaseNetwork(chainId);
  return network && isValidTransactionHash(hash) ? `${network.explorerUrl}/tx/${hash}` : null;
}

export function getReceiptStatus(receipt) {
  if (!receipt) {
    return "Pending";
  }

  if (receipt.status === "0x1") {
    return "Success";
  }

  if (receipt.status === "0x0") {
    return "Failed";
  }

  return "Unknown";
}

export function formatTransactionValue(transaction) {
  return transaction?.value ? formatEthBalance(transaction.value) : "-";
}
