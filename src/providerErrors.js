const ERROR_MESSAGES = {
  4001: "Wallet request rejected",
  4100: "Wallet permission denied",
  4900: "Wallet is disconnected",
  4901: "Wallet is not connected to the requested chain",
  4902: "Network is not available in this wallet",
};

export function getProviderErrorMessage(error, fallback = "Wallet request failed") {
  if (!error) {
    return fallback;
  }

  if (typeof error.code === "number" && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
