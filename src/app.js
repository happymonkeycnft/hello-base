import { getBaseNetwork, getExplorerAddressUrl, getWalletSwitchParams } from "./baseNetworks.js";
import { formatEthBalance, hexToDecimalString } from "./eth.js";
import { getProviderErrorMessage } from "./providerErrors.js";
import { formatAddress, isValidEvmAddress } from "./address.js";
import { formatLastUpdated, getWalletStatusText } from "./uiState.js";
import {
  ERC20_CALLS,
  decodeStringResult,
  decodeUint256,
  decodeUint8,
  encodeBalanceOf,
  formatTokenBalance,
} from "./erc20.js";
import {
  formatTransactionValue,
  getExplorerTransactionUrl,
  getReceiptStatus,
  isValidTransactionHash,
  normalizeTransactionHash,
} from "./transactions.js";

const state = {
  account: null,
  balance: null,
  chainId: null,
  errorMessage: "",
  isConnecting: false,
  isLoadingBalance: false,
  isLoadingBlock: false,
  latestBlock: null,
  pendingSwitchChainId: null,
  transactionError: "",
  transactionHash: "",
  transactionMessage: "Enter a Base transaction hash.",
  transaction: null,
  transactionReceipt: null,
  transactionLookupAttempted: false,
  isLoadingTransaction: false,
  tokenAddress: "",
  tokenError: "",
  tokenMessage: "Enter an ERC-20 contract on Base.",
  tokenMetadata: null,
  tokenBalance: null,
  isLoadingToken: false,
  balanceUpdatedAt: null,
  blockUpdatedAt: null,
  transactionUpdatedAt: null,
  tokenUpdatedAt: null,
};

const connectButton = document.querySelector("#connectButton");
const walletStatus = document.querySelector("#walletStatus");
const walletAddress = document.querySelector("#walletAddress");
const networkName = document.querySelector("#networkName");
const chainIdLabel = document.querySelector("#chainId");
const ethBalance = document.querySelector("#ethBalance");
const latestBlock = document.querySelector("#latestBlock");
const switchButtons = document.querySelectorAll("[data-switch-chain]");
const transactionForm = document.querySelector("#transactionForm");
const transactionHashInput = document.querySelector("#transactionHash");
const transactionMessage = document.querySelector("#transactionMessage");
const transactionStatus = document.querySelector("#transactionStatus");
const transactionBlock = document.querySelector("#transactionBlock");
const transactionFrom = document.querySelector("#transactionFrom");
const transactionTo = document.querySelector("#transactionTo");
const transactionValue = document.querySelector("#transactionValue");
const transactionExplorer = document.querySelector("#transactionExplorer");
const tokenForm = document.querySelector("#tokenForm");
const tokenAddressInput = document.querySelector("#tokenAddress");
const tokenMessage = document.querySelector("#tokenMessage");
const tokenName = document.querySelector("#tokenName");
const tokenSymbol = document.querySelector("#tokenSymbol");
const tokenDecimals = document.querySelector("#tokenDecimals");
const tokenBalance = document.querySelector("#tokenBalance");
const tokenContract = document.querySelector("#tokenContract");
const tokenNetwork = document.querySelector("#tokenNetwork");
const summaryWallet = document.querySelector("#summaryWallet");
const summaryNetwork = document.querySelector("#summaryNetwork");
const summaryBalance = document.querySelector("#summaryBalance");
const summaryBlock = document.querySelector("#summaryBlock");
const refreshBalanceButton = document.querySelector("#refreshBalanceButton");
const refreshBlockButton = document.querySelector("#refreshBlockButton");
const refreshTokenButton = document.querySelector("#refreshTokenButton");
const summaryUpdated = document.querySelector("#summaryUpdated");
const networkUpdated = document.querySelector("#networkUpdated");
const transactionUpdated = document.querySelector("#transactionUpdated");
const tokenUpdated = document.querySelector("#tokenUpdated");

function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function render() {
  const baseNetwork = getBaseNetwork(state.chainId);
  const addressUrl = getExplorerAddressUrl(state.chainId, state.account);

  walletStatus.textContent = getWalletStatusText(state);
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
  latestBlock.textContent = state.isLoadingBlock
    ? "Loading..."
    : baseNetwork
      ? hexToDecimalString(state.latestBlock)
      : "-";
  connectButton.textContent = state.account ? "Disconnect" : "Connect wallet";
  connectButton.disabled = state.isConnecting;
  refreshBalanceButton.disabled = !state.account || !baseNetwork || state.isLoadingBalance;
  refreshBalanceButton.textContent = state.isLoadingBalance ? "Refreshing ETH..." : "Refresh ETH";
  refreshBlockButton.disabled = !baseNetwork || state.isLoadingBlock;
  refreshBlockButton.textContent = state.isLoadingBlock ? "Refreshing block..." : "Refresh block";
  refreshTokenButton.disabled =
    !state.account || !baseNetwork || !isValidEvmAddress(state.tokenAddress) || state.isLoadingToken;
  refreshTokenButton.textContent = state.isLoadingToken ? "Refreshing token..." : "Refresh token";

  switchButtons.forEach((button) => {
    const targetChainId = button.dataset.switchChain;
    button.disabled = !hasInjectedWallet() || state.pendingSwitchChainId === targetChainId;
    button.textContent =
      state.pendingSwitchChainId === targetChainId
        ? "Switching..."
        : targetChainId === "0x2105"
          ? "Switch to Base"
          : "Switch to Base Sepolia";
  });

  transactionMessage.textContent = state.transactionError || state.transactionMessage;
  transactionMessage.classList.toggle("is-error", Boolean(state.transactionError));
  transactionStatus.textContent = state.isLoadingTransaction
    ? "Loading..."
    : state.transaction
      ? getReceiptStatus(state.transactionReceipt)
      : state.transactionLookupAttempted && !state.transactionError
        ? "Not found"
      : "-";
  transactionBlock.textContent =
    state.transactionReceipt?.blockNumber ?? state.transaction?.blockNumber ?? "-";
  renderAddressLink(transactionFrom, state.transaction?.from);
  renderAddressLink(transactionTo, state.transaction?.to);
  transactionValue.textContent = formatTransactionValue(state.transaction);
  transactionExplorer.textContent = "";
  const txUrl = getExplorerTransactionUrl(state.chainId, state.transactionHash);
  if (txUrl && state.transaction) {
    const link = document.createElement("a");
    link.href = txUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open in BaseScan";
    transactionExplorer.append(link);
  } else {
    transactionExplorer.textContent = "-";
  }

  tokenMessage.textContent = state.tokenError || state.tokenMessage;
  tokenMessage.classList.toggle("is-error", Boolean(state.tokenError));
  tokenName.textContent = state.isLoadingToken ? "Loading..." : state.tokenMetadata?.name ?? "-";
  tokenSymbol.textContent = state.tokenMetadata?.symbol ?? "-";
  tokenDecimals.textContent = state.tokenMetadata?.decimals?.toString() ?? "-";
  tokenBalance.textContent =
    state.tokenMetadata && state.tokenBalance !== null
      ? formatTokenBalance(state.tokenBalance, state.tokenMetadata.decimals, state.tokenMetadata.symbol)
      : "-";
  renderAddressLink(tokenContract, state.tokenAddress);
  tokenNetwork.textContent = baseNetwork?.name ?? "-";

  summaryWallet.textContent = state.account ? formatAddress(state.account) : "Disconnected";
  summaryNetwork.textContent = baseNetwork?.name ?? (state.chainId ? "Unsupported" : "-");
  summaryBalance.textContent =
    state.account && baseNetwork && state.balance ? formatEthBalance(state.balance) : "-";
  summaryBlock.textContent = baseNetwork ? hexToDecimalString(state.latestBlock) : "-";
  summaryUpdated.textContent = formatLastUpdated(state.balanceUpdatedAt || state.blockUpdatedAt);
  networkUpdated.textContent = formatLastUpdated(state.blockUpdatedAt);
  transactionUpdated.textContent = formatLastUpdated(state.transactionUpdatedAt);
  tokenUpdated.textContent = formatLastUpdated(state.tokenUpdatedAt);
}

function renderAddressLink(element, address) {
  element.textContent = "";
  const addressUrl = getExplorerAddressUrl(state.chainId, address);

  if (!addressUrl) {
    element.textContent = address ? formatAddress(address) : "-";
    return;
  }

  const link = document.createElement("a");
  link.href = addressUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = formatAddress(address);
  link.title = address;
  element.append(link);
}

function setProviderError(error, fallback) {
  state.errorMessage = getProviderErrorMessage(error, fallback);
  render();
}

function clearTokenResult() {
  state.tokenMetadata = null;
  state.tokenBalance = null;
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
    state.balanceUpdatedAt = new Date().toISOString();
    state.errorMessage = "";
  } catch (error) {
    state.balance = null;
    setProviderError(error, "Unable to load ETH balance");
  } finally {
    state.isLoadingBalance = false;
    render();
  }
}

async function refreshLatestBlock() {
  const baseNetwork = getBaseNetwork(state.chainId);
  if (!hasInjectedWallet() || !baseNetwork) {
    state.latestBlock = null;
    render();
    return;
  }

  state.isLoadingBlock = true;
  render();

  try {
    state.latestBlock = await window.ethereum.request({ method: "eth_blockNumber" });
    state.blockUpdatedAt = new Date().toISOString();
    state.errorMessage = "";
  } catch (error) {
    state.latestBlock = null;
    setProviderError(error, "Unable to load latest block");
  } finally {
    state.isLoadingBlock = false;
    render();
  }
}

async function switchNetwork(chainId) {
  if (!hasInjectedWallet()) {
    state.errorMessage = "No injected wallet found";
    render();
    return;
  }

  const params = getWalletSwitchParams(chainId);
  if (!params) {
    state.errorMessage = "Unsupported Base network";
    render();
    return;
  }

  state.pendingSwitchChainId = chainId;
  state.errorMessage = "";
  render();

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (error) {
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [params],
      });
    } else {
      throw error;
    }
  } finally {
    state.pendingSwitchChainId = null;
    render();
  }

  await refreshChain();
  await Promise.all([refreshLatestBlock(), refreshBalance()]);
}

async function lookupTransaction(hash) {
  const baseNetwork = getBaseNetwork(state.chainId);
  if (!hasInjectedWallet()) {
    state.transactionError = "Connect a wallet provider before looking up transactions.";
    state.transaction = null;
    state.transactionReceipt = null;
    render();
    return;
  }

  if (!baseNetwork) {
    state.transactionError = "Switch to Base or Base Sepolia before looking up transactions.";
    state.transaction = null;
    state.transactionReceipt = null;
    render();
    return;
  }

  state.isLoadingTransaction = true;
  state.transactionError = "";
  state.transactionMessage = "Looking up transaction...";
  state.transaction = null;
  state.transactionReceipt = null;
  state.transactionLookupAttempted = true;
  render();

  try {
    const transaction = await window.ethereum.request({
      method: "eth_getTransactionByHash",
      params: [hash],
    });
    const receipt = transaction
      ? await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        })
      : null;

    state.transaction = transaction;
    state.transactionReceipt = receipt;
    state.transactionMessage = transaction
      ? "Transaction loaded from wallet provider."
      : "Transaction not found on the selected Base network.";
    state.transactionUpdatedAt = new Date().toISOString();
  } catch (error) {
    state.transaction = null;
    state.transactionReceipt = null;
    state.transactionError = getProviderErrorMessage(error, "Unable to look up transaction");
  } finally {
    state.isLoadingTransaction = false;
    render();
  }
}

async function callContract(to, data) {
  return window.ethereum.request({
    method: "eth_call",
    params: [{ to, data }, "latest"],
  });
}

async function lookupTokenMetadata(address) {
  const baseNetwork = getBaseNetwork(state.chainId);
  if (!hasInjectedWallet()) {
    state.tokenError = "Connect a wallet provider before looking up tokens.";
    clearTokenResult();
    render();
    return;
  }

  if (!state.account) {
    state.tokenError = "Connect a wallet before checking token balances.";
    clearTokenResult();
    render();
    return;
  }

  if (!baseNetwork) {
    state.tokenError = "Switch to Base or Base Sepolia before looking up tokens.";
    clearTokenResult();
    render();
    return;
  }

  state.isLoadingToken = true;
  state.tokenError = "";
  state.tokenMessage = "Loading token metadata...";
  clearTokenResult();
  render();

  try {
    const [nameResult, symbolResult, decimalsResult] = await Promise.all([
      callContract(address, ERC20_CALLS.name),
      callContract(address, ERC20_CALLS.symbol),
      callContract(address, ERC20_CALLS.decimals),
    ]);
    const metadata = {
      name: decodeStringResult(nameResult),
      symbol: decodeStringResult(symbolResult),
      decimals: decodeUint8(decimalsResult),
    };

    if (!metadata.symbol || !Number.isInteger(metadata.decimals)) {
      throw new Error("Contract does not expose standard ERC-20 metadata.");
    }

    state.tokenMetadata = metadata;
    const balanceResult = await callContract(address, encodeBalanceOf(state.account));
    state.tokenBalance = decodeUint256(balanceResult);
    state.tokenMessage = "Token balance loaded.";
    state.tokenUpdatedAt = new Date().toISOString();
  } catch (error) {
    clearTokenResult();
    state.tokenError = getProviderErrorMessage(error, "Unable to load ERC-20 metadata");
  } finally {
    state.isLoadingToken = false;
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
    await refreshLatestBlock();
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
    setProviderError(error, "Unable to connect wallet");
  });
});

switchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchNetwork(button.dataset.switchChain).catch((error) => {
      state.pendingSwitchChainId = null;
      setProviderError(error, "Unable to switch network");
    });
  });
});

refreshBalanceButton.addEventListener("click", () => {
  refreshBalance().catch((error) => {
    setProviderError(error, "Unable to refresh ETH balance");
  });
});

refreshBlockButton.addEventListener("click", () => {
  refreshLatestBlock().catch((error) => {
    setProviderError(error, "Unable to refresh latest block");
  });
});

transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const hash = normalizeTransactionHash(transactionHashInput.value);
  state.transactionHash = hash;

  if (!isValidTransactionHash(hash)) {
    state.transactionError = "Enter a valid 66-character transaction hash.";
    state.transactionMessage = "";
    state.transaction = null;
    state.transactionReceipt = null;
    state.transactionLookupAttempted = false;
    render();
    return;
  }

  state.transactionError = "";
  lookupTransaction(hash);
});

tokenForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const address = tokenAddressInput.value.trim();
  state.tokenAddress = address;

  if (!isValidEvmAddress(address)) {
    state.tokenError = "Enter a valid ERC-20 contract address.";
    state.tokenMessage = "";
    clearTokenResult();
    render();
    return;
  }

  state.tokenError = "";
  lookupTokenMetadata(address);
});

refreshTokenButton.addEventListener("click", () => {
  if (!isValidEvmAddress(state.tokenAddress)) {
    state.tokenError = "Enter a valid ERC-20 contract address before refreshing.";
    render();
    return;
  }

  lookupTokenMetadata(state.tokenAddress);
});

if (hasInjectedWallet()) {
  window.ethereum
    .request({ method: "eth_accounts" })
    .then((accounts) => {
      state.account = accounts[0] ?? null;
      render();
      return refreshChain().then(() => Promise.all([refreshLatestBlock(), refreshBalance()]));
    })
    .catch(() => {
      render();
    });

  window.ethereum.on?.("accountsChanged", (accounts) => {
    state.account = accounts[0] ?? null;
    state.balance = null;
    state.latestBlock = null;
    render();
    Promise.all([refreshLatestBlock(), refreshBalance()]).catch(() => {
      state.balance = null;
      state.isLoadingBalance = false;
      state.isLoadingBlock = false;
      render();
    });
  });

  window.ethereum.on?.("chainChanged", (chainId) => {
    state.chainId = chainId;
    state.balance = null;
    state.latestBlock = null;
    render();
    Promise.all([refreshLatestBlock(), refreshBalance()]).catch(() => {
      state.balance = null;
      state.isLoadingBalance = false;
      state.isLoadingBlock = false;
      render();
    });
  });
}

render();
