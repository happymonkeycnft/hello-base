# Hello Base

Base Wallet Activity Dashboard for exploring wallet state on Base networks.

## Features

- Connect and disconnect an injected wallet such as Coinbase Wallet or MetaMask.
- Detect Base mainnet and Base Sepolia from the connected wallet.
- Show connected account, chain ID, and network status.
- Link supported Base wallet addresses to the matching BaseScan explorer.
- Look up Base transaction hashes and inspect status, block, participants, value, and explorer links.
- Validate EVM wallet addresses with Node test coverage.
- Validate transaction hashes before making wallet provider RPC requests.

## Supported Networks

| Network | Chain ID | RPC |
| --- | ---: | --- |
| Base | 8453 | `https://mainnet.base.org` |
| Base Sepolia | 84532 | `https://sepolia.base.org` |

## Local Setup

```bash
npm install
npm test
npm run build
```

Open `index.html` in a browser with an injected wallet to try the dashboard locally.

## Transaction Lookup

Use the transaction inspector after connecting a wallet provider and switching to Base or Base Sepolia. The dashboard validates hash format before making RPC requests, shows not-found responses clearly, and reports wallet/provider errors without exposing credentials.

## Development Notes

This project is intentionally dependency-light while the first wallet dashboard milestone is being built. Do not commit private keys, seed phrases, API keys, wallet secrets, or `.env` files.

## Deployment

The app is static and can be deployed with GitHub Pages, Netlify, Vercel, or any static host. Use Base Sepolia while testing wallet flows before relying on Base mainnet interactions.
