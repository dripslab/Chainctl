# Contributing to Chainctl

Thanks for helping improve Chainctl.

## Local setup

```bash
npm install
node src/index.js --help
```

## Development workflow

1. Create a focused branch for your change.
2. Keep command behavior small, scriptable, and documented with Commander help text.
3. Prefer JSON output by default and `--pretty` tables for interactive terminal use.
4. Run the relevant command locally before opening a pull request.
5. Include a short terminal demo in your pull request description.

## Commit style

Use clear, imperative commit messages, for example:

```text
Add balance command
Fix friendbot address validation
```

## Security

Never commit secret keys, funded accounts, `.env` files, or local wallet material.
