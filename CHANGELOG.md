# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0 - 2026-05-09

Initial release of `chainctl`, a command-line toolkit for Stellar developers.

### Global Flags

- `-V, --version` - Show the current `chainctl` version.
- `-n, --network <network>` - Select the Stellar network to use: `testnet` or `mainnet`. Defaults to `testnet`.
- `--pretty` - Render supported output in a human-readable format.
- `-h, --help` - Show help for the CLI or a specific command.

### Commands

#### `chainctl keypair`

Manage Stellar keypairs.

- `-h, --help` - Show help for the command group.
- `chainctl keypair generate` - Generate a new Stellar keypair.
  - `--pretty` - Print the generated keypair as labeled text instead of JSON.
  - `-h, --help` - Show help for the command.

#### `chainctl balance <address>`

Check an account balance using the Horizon API.

- `<address>` - Stellar public key to inspect.
- `--pretty` - Print balances as a table.
- `-h, --help` - Show help for the command.

This command also supports the global `--network` and `--pretty` flags.

#### `chainctl help [command]`

Display help for `chainctl` or a specific command.

- `[command]` - Optional command name to show help for.

#### `chainctl friendbot <address>`

Fund a Stellar testnet account with Friendbot.

- `<address>` - Stellar public key to fund.
- `--pretty` - Print a short human-readable result.
- `-h, --help` - Show help for the command.

This command supports the global `--network` flag and only runs on `testnet`.

#### `chainctl send`

Send XLM from one account to another.

- `--from <secret>` - Secret key of the sender. Required.
- `--to <address>` - Public key of the recipient. Required.
- `--amount <amount>` - Amount of XLM to send. Required.
- `--memo <memo>` - Optional text memo to include with the payment.
- `--pretty` - Print a short human-readable result.
- `-h, --help` - Show help for the command.

This command also supports the global `--network` and `--pretty` flags.
