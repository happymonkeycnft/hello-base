const state = {
  account: null,
  isConnecting: false,
};

const connectButton = document.querySelector("#connectButton");
const walletStatus = document.querySelector("#walletStatus");
const walletAddress = document.querySelector("#walletAddress");

function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function render() {
  walletStatus.textContent = state.isConnecting
    ? "Connecting..."
    : state.account
      ? "Connected"
      : "Not connected";
  walletAddress.textContent = state.account ?? "-";
  connectButton.textContent = state.account ? "Disconnect" : "Connect wallet";
  connectButton.disabled = state.isConnecting;
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
    })
    .catch(() => {
      render();
    });

  window.ethereum.on?.("accountsChanged", (accounts) => {
    state.account = accounts[0] ?? null;
    render();
  });
}

render();
