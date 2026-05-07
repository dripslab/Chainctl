const { Command } = require("commander");
const StellarSdk = require("stellar-sdk");

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
        console.log(`Public Key: ${result.publicKey}`);
        console.log(`Secret Key: ${result.secretKey}`);
        return;
      }

      console.log(JSON.stringify(result, null, 2));
    });

  return keypair;
}

module.exports = {
  createKeypairCommand
};
