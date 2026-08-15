export const BASE_NETWORKS = {
  "0x2105": {
    chainId: "0x2105",
    decimalChainId: 8453,
    name: "Base",
    shortName: "base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  "0x14a34": {
    chainId: "0x14a34",
    decimalChainId: 84532,
    name: "Base Sepolia",
    shortName: "base-sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

export function getBaseNetwork(chainId) {
  return BASE_NETWORKS[chainId] ?? null;
}

export function getExplorerAddressUrl(chainId, address) {
  const network = getBaseNetwork(chainId);
  return network && address ? `${network.explorerUrl}/address/${address}` : null;
}

export function getWalletSwitchParams(chainId) {
  const network = getBaseNetwork(chainId);
  if (!network) {
    return null;
  }

  return {
    chainId: network.chainId,
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: [network.explorerUrl],
  };
}

export function getSupportedBaseNetworks() {
  return Object.values(BASE_NETWORKS);
}
