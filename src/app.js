import { getBaseNetwork, getExplorerAddressUrl } from "./baseNetworks.js";

const state = {
  account: null,
  chainId: null,
  isConnecting: false,
};

const connectButton = document.querySelector("#connectButton");
const walletStatus = document.querySelector("#walletStatus");
const walletAddress = document.querySelector("#walletAddress");
const networkName = document.querySelector("#networkName");
const chainIdLabel = document.querySelector("#chainId");

function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function render() {
  const baseNetwork = getBaseNetwork(state.chainId);
  const addressUrl = getExplorerAddressUrl(state.chainId, state.account);

  walletStatus.textContent = state.isConnecting
    ? "Connecting..."
    : state.account
      ? "Connected"
      : "Not connected";
  walletAddress.textContent = "";
  if (addressUrl) {
    const link = document.createElement("a");
    link.href = addressUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = state.account;
    walletAddress.append(link);
  } else {
    walletAddress.textContent = state.account ?? "-";
  }
  networkName.textContent = baseNetwork?.name ?? (state.chainId ? "Unsupported network" : "-");
  chainIdLabel.textContent = state.chainId ?? "-";
  connectButton.textContent = state.account ? "Disconnect" : "Connect wallet";
  connectButton.disabled = state.isConnecting;
}

async function refreshChain() {
  if (!hasInjectedWallet()) {
    state.chainId = null;
    render();
    return;
  }

  state.chainId = await window.ethereum.request({ method: "eth_chainId" });
  render();
}

async function connectWallet() {
  if (!hasInjectedWallet()) {
    walletStatus.textContent = "No injected wallet found";
    return;
  }

  state.isConnecting = true;
  render();

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    state.account = accounts[0] ?? null;
    await refreshChain();
  } finally {
    state.isConnecting = false;
    render();
  }
}

function disconnectWallet() {
  state.account = null;
  render();
}

connectButton.addEventListener("click", () => {
  if (state.account) {
    disconnectWallet();
    return;
  }

  connectWallet().catch((error) => {
    walletStatus.textContent = error.message || "Unable to connect wallet";
  });
});

if (hasInjectedWallet()) {
  window.ethereum
    .request({ method: "eth_accounts" })
    .then((accounts) => {
      state.account = accounts[0] ?? null;
      render();
      return refreshChain();
    })
    .catch(() => {
      render();
    });

  window.ethereum.on?.("accountsChanged", (accounts) => {
    state.account = accounts[0] ?? null;
    render();
  });

  window.ethereum.on?.("chainChanged", (chainId) => {
    state.chainId = chainId;
    render();
  });
}

render();
