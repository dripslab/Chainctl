const { Command } = require("commander");
const StellarSdk = require("stellar-sdk");
const { printJson, printSuccess } = require("../output/json");

function createKeypairCommand() {
  const keypair = new Command("keypair").description("Manage Stellar keypairs");

  keypair
    .command("generate")
    .description("Generate a new Stellar keypair")
    .option("--pretty", "Print keypair as labeled text instead of JSON")
    .action((options) => {
      const pair = StellarSdk.Keypair.random();
      const result = {
        publicKey: pair.publicKey(),
        secretKey: pair.secret()
      };

      if (options.pretty) {
        printSuccess(`Public Key: ${result.publicKey}`);
        printSuccess(`Secret Key: ${result.secretKey}`);
        return;
      }

      printJson(result);
    });

  return keypair;
}

module.exports = {
  createKeypairCommand
};
