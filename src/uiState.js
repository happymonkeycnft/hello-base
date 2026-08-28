export function hasPendingRequest(state) {
  return Boolean(
    state.isConnecting ||
      state.isLoadingBalance ||
      state.isLoadingBlock ||
      state.isLoadingTransaction ||
      state.isLoadingToken ||
      state.pendingSwitchChainId,
  );
}

export function getWalletStatusText(state) {
  if (state.isConnecting) {
    return "Connecting...";
  }

  if (state.errorMessage) {
    return state.errorMessage;
  }

  return state.account ? "Connected" : "Not connected";
}

export function formatLastUpdated(timestamp) {
  if (!timestamp) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}
