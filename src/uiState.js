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

export function canRefreshBalance(state, baseNetwork) {
  return Boolean(state.account && baseNetwork && !state.isConnecting && !state.isLoadingBalance);
}

export function canRefreshBlock(state, baseNetwork) {
  return Boolean(baseNetwork && !state.isLoadingBlock);
}

export function canRefreshToken(state, baseNetwork, hasValidTokenAddress) {
  return Boolean(
    state.account &&
      baseNetwork &&
      hasValidTokenAddress &&
      !state.isConnecting &&
      !state.isLoadingToken,
  );
}

export function getActionLabel(isPending, idleLabel, pendingLabel) {
  return isPending ? pendingLabel : idleLabel;
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
