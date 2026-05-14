const { Command } = require("commander");
const StellarSdk = require("stellar-sdk");
const { printJson, printSuccess } = require("../output/json");

function validatePublicKey(address) {
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("Invalid Stellar public key.");
  }
}

function createFriendbotCommand() {
  return new Command("friendbot")
    .description("Fund a Stellar testnet account with Friendbot")
    .argument("<address>", "Stellar public key to fund")
    .option("--pretty", "Print a short human-readable result")
    .action(async (address, options, command) => {
      validatePublicKey(address);

      const network = command.optsWithGlobals().network;
      if (network !== "testnet") {
        throw new Error("Friendbot only works on testnet.");
      }

      const url = new URL("https://friendbot.stellar.org");
      url.searchParams.set("addr", address);

      const response = await fetch(url);
      const payload = await response.json();

      if (!response.ok) {
        const detail = payload.detail || payload.title || response.statusText;
        throw new Error(`Friendbot request failed: ${detail}`);
      }

      if (options.pretty || command.optsWithGlobals().pretty) {
        printSuccess(`Funded ${address} on testnet.`);
        printSuccess(`Transaction: ${payload.hash}`);
        return;
      }

      printJson(payload);
    });
}

module.exports = {
  createFriendbotCommand
};
