import { getBaseNetwork, getExplorerAddressUrl } from "./baseNetworks.js";
import { formatEthBalance } from "./eth.js";

const state = {
  account: null,
  balance: null,
  chainId: null,
  isConnecting: false,
  isLoadingBalance: false,
};

const connectButton = document.querySelector("#connectButton");
const walletStatus = document.querySelector("#walletStatus");
const walletAddress = document.querySelector("#walletAddress");
const networkName = document.querySelector("#networkName");
const chainIdLabel = document.querySelector("#chainId");
const ethBalance = document.querySelector("#ethBalance");

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
  ethBalance.textContent = state.isLoadingBalance
    ? "Loading..."
    : state.account && baseNetwork
      ? formatEthBalance(state.balance)
      : "-";
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

async function refreshBalance() {
  const baseNetwork = getBaseNetwork(state.chainId);
  if (!hasInjectedWallet() || !state.account || !baseNetwork) {
    state.balance = null;
    render();
    return;
  }

  state.isLoadingBalance = true;
  render();

  try {
    state.balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [state.account, "latest"],
    });
  } finally {
    state.isLoadingBalance = false;
    render();
  }
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
    await refreshBalance();
  } finally {
    state.isConnecting = false;
    render();
  }
}

function disconnectWallet() {
  state.account = null;
  state.balance = null;
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
      return refreshChain().then(() => refreshBalance());
    })
    .catch(() => {
      render();
    });

  window.ethereum.on?.("accountsChanged", (accounts) => {
    state.account = accounts[0] ?? null;
    state.balance = null;
    render();
    refreshBalance().catch(() => {
      state.balance = null;
      state.isLoadingBalance = false;
      render();
    });
  });

  window.ethereum.on?.("chainChanged", (chainId) => {
    state.chainId = chainId;
    state.balance = null;
    render();
    refreshBalance().catch(() => {
      state.balance = null;
      state.isLoadingBalance = false;
      render();
    });
  });
}

render();
