# Chain# chainctl

> A command-line toolkit for Stellar developers — create keypairs, check balances, send transactions, deploy Soroban contracts, and query Horizon, all from your terminal.

[![npm version](https://img.shields.io/npm/v/chainctl)](https://www.npmjs.com/package/chainctl)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![Stellar](https://img.shields.io/badge/Built%20for-Stellar-blue)](https://stellar.org)
[![Drips Wave](https://img.shields.io/badge/Drips-Wave%20Program-purple)](https://drips.network/wave)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## The Problem

Stellar developers constantly switch between browser tools, the Stellar Laboratory UI, and custom one-off scripts just to do basic tasks. There is no single CLI that brings common operations together cleanly — one that works well in scripts, CI pipelines, and day-to-day development.

## The Solution

**chainctl** is an npm-installable CLI built with Node.js and Commander.js. Every command follows a consistent interface, outputs JSON by default (perfect for scripting), supports `--pretty` for human-readable table output, and works against both testnet and mainnet with a single `--network` flag.

---

## Install

```bash
# Install globally
npm install -g chainctl

# Or run without installing
npx chainctl <command>
```

**Requirements:** Node.js 18 or higher.

---

## Quick Examples

```bash
# Generate a new Stellar keypair
chainctl keypair generate

# Fund a testnet account via Friendbot
chainctl friendbot GXXXX...

# Check account balance
chainctl balance GXXXX...

# Send XLM
chainctl send --from SXXXX... --to GXXXX... --amount 10 --memo "payment"

# Deploy a Soroban smart contract
chainctl contract deploy ./my_contract.wasm --network testnet

# Invoke a Soroban function
chainctl contract invoke CONTRACT_ID hello --args '["world"]'

# Get transaction history (last 20)
chainctl history GXXXX... --limit 20

# Switch to mainnet for any command
chainctl --network mainnet balance GXXXX...

# Output as pretty table instead of JSON
chainctl balance GXXXX... --pretty
```

---

## Full Command Reference

### `keypair`

```bash
chainctl keypair generate
# Outputs: { publicKey, secretKey }
# WARNING: save your secret key — it is shown only once
```

### `balance`

```bash
chainctl balance <address> [options]

Options:
  --network   testnet | mainnet   (default: testnet)
  --pretty    Table output instead of JSON
  --output    csv                 Export to CSV file
```

### `send`

```bash
chainctl send [options]

Options:
  --from      Secret key of sender (required)
  --to        Destination address (required)
  --amount    Amount to send (required)
  --asset     Asset code (default: XLM)
  --memo      Optional memo text
  --network   testnet | mainnet
```

### `friendbot`

```bash
chainctl friendbot <address>
# Funds the address with 10,000 XLM on testnet
# Does not work on mainnet
```

### `history`

```bash
chainctl history <address> [options]

Options:
  --limit     Number of transactions (default: 10, max: 200)
  --network   testnet | mainnet
  --pretty    Table output
  --output    csv
```

### `contract deploy`

```bash
chainctl contract deploy <wasm-file> [options]

Options:
  --network   testnet | mainnet
  --source    Secret key of deployer account (required)
```

### `contract invoke`

```bash
chainctl contract invoke <contract-id> <function-name> [options]

Options:
  --args      JSON array of function arguments
  --network   testnet | mainnet
  --source    Secret key of invoker account
```

---

## Technical Architecture

```
Terminal
│
└── chainctl (Node.js CLI)
      ├── Commander.js         → Parses subcommands and flags
      ├── src/commands/        → One file per subcommand
      │     ├── keypair.js
      │     ├── balance.js
      │     ├── send.js
      │     ├── friendbot.js
      │     ├── history.js
      │     └── contract.js
      ├── src/stellar/         → stellar-sdk wrappers
      │     ├── account.js     → Fetch account, validate address
      │     ├── transaction.js → Build + sign + submit transactions
      │     └── soroban.js     → Contract deploy + invoke
      ├── src/output/          → Formatters
      │     ├── json.js        → Default JSON output
      │     ├── table.js       → --pretty table output (cli-table3)
      │     └── csv.js         → --output csv export
      └── src/config/
            └── rc.js          → Reads .chainctlrc from home directory
```

**Stack:**

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ (ESM modules) |
| CLI framework | Commander.js — subcommand routing |
| Stellar SDK | `stellar-sdk` — transaction building and signing |
| Horizon client | Built-in SDK + Axios with retry for REST calls |
| Output formatting | `cli-table3` for `--pretty`, raw JSON default |
| Config file | `.chainctlrc` in home directory (TOML format) |
| Testing | Vitest (unit) + testnet integration tests (CI) |
| Distribution | npm package (`npx chainctl` or global install) |

---

## Repository Structure

```
chainctl/
├── src/
│   ├── commands/
│   │   ├── keypair.js       # keypair generate
│   │   ├── balance.js       # balance <address>
│   │   ├── send.js          # send --from --to --amount
│   │   ├── friendbot.js     # friendbot <address>
│   │   ├── history.js       # history <address>
│   │   └── contract.js      # contract deploy / invoke
│   ├── stellar/
│   │   ├── account.js       # Account fetch + validation
│   │   ├── transaction.js   # Build, sign, submit
│   │   └── soroban.js       # Soroban contract helpers
│   ├── output/
│   │   ├── json.js          # JSON formatter
│   │   ├── table.js         # cli-table3 pretty output
│   │   └── csv.js           # CSV export
│   ├── config/
│   │   └── rc.js            # .chainctlrc reader
│   └── index.js             # CLI entry point
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── integration/         # Live testnet tests (run in CI)
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Configuration File

You can set defaults in `~/.chainctlrc` to avoid repeating flags:

```toml
network = "testnet"
pretty  = false

[accounts]
default = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/onrampx/chainctl.git
cd chainctl

# 2. Install dependencies
npm install

# 3. Link locally so you can run 'chainctl' in your terminal
npm link

# 4. Test it works
chainctl --help

# 5. Run unit tests
npm test

# 6. Run integration tests (hits Stellar testnet — needs internet)
npm run test:integration

# 7. Unlink when done
npm unlink
```

### Adding a new command

```bash
# 1. Create the command file
touch src/commands/mycommand.js

# 2. Follow the pattern in src/commands/balance.js
# 3. Register it in src/index.js
# 4. Add --help descriptions (all flags must have descriptions)
# 5. Write tests in tests/unit/mycommand.test.js
```

---

## Open Issues (Wave Program)

These issues are part of the **Stellar Wave Program** on Drips. Contributors earn Points for resolving them.

| # | Issue | Complexity | Points |
|---|-------|-----------|--------|
| 1 | Add `--help` descriptions to all existing commands | Trivial | 100 |
| 2 | Add balance CSV export flag (`--output csv`) | Medium | 150 |
| 3 | Build Soroban contract deploy command | High | 200 |
| 4 | Add `chainctl init` config setup wizard | Medium | 150 |
| 5 | Write integration tests for `send` command | High | 200 |

To apply for an issue, visit the [Drips Wave dashboard](https://drips.network/wave) or apply directly on GitHub.

---

## Contributing

1. Fork this repo
2. Create a branch: `git checkout -b feat/your-feature-name`
3. Make your changes inside `src/commands/` or `src/stellar/`
4. Write or update tests in `tests/`
5. Run `npm test` — all tests must pass
6. Open a Pull Request with a short terminal demo in the description

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style and commit conventions.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Maintainer

Built and maintained by jotel-dev.
Part of the [Stellar Wave Program](https://drips.network/wave) on Drips.
