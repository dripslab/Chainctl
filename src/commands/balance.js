const { Command } = require("commander");
const Table = require("cli-table3");
const StellarSdk = require("stellar-sdk");

const HORIZON_URLS = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org"
};

function getNetwork(program) {
  const network = program.optsWithGlobals().network;

  if (!HORIZON_URLS[network]) {
    throw new Error(`Unsupported network "${network}". Use testnet or mainnet.`);
  }

  return network;
}

function validatePublicKey(address) {
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("Invalid Stellar public key.");
  }
}

function createServer(network) {
  const Server = StellarSdk.Horizon.Server;
  return new Server(HORIZON_URLS[network]);
}

function getHorizonDetail(error) {
  return (
    error.response?.data?.detail ||
    error.response?.data?.title ||
    error.response?.statusText ||
    error.message ||
    "No additional details were provided."
  );
}

function getBalanceErrorMessage(error, address, network) {
  const status = error.response?.status;

  if (status === 404) {
    return `Account ${address} was not found on ${network}. Make sure the account is funded and that you selected the right network.`;
  }

  if (status) {
    return `Unable to fetch balance from Horizon (${status}): ${getHorizonDetail(error)}`;
  }

  if (error.name === "TypeError" || error.code || !error.message) {
    return `Unable to reach Horizon for ${network}. Check your internet connection and try again.`;
  }

  return `Unable to fetch balance: ${error.message}`;
}

function printBalances(accountId, network, balances, pretty) {
  if (pretty) {
    const table = new Table({
      head: ["Asset", "Issuer", "Balance"],
      wordWrap: true
    });

    for (const balance of balances) {
      table.push([
        balance.asset_type === "native" ? "XLM" : balance.asset_code,
        balance.asset_issuer || "-",
        balance.balance
      ]);
    }

    console.log(table.toString());
    return;
  }

  console.log(JSON.stringify({ accountId, network, balances }, null, 2));
}

function createBalanceCommand() {
  return new Command("balance")
    .description("Check an account balance using the Horizon API")
    .argument("<address>", "Stellar public key")
    .option("--pretty", "Print balances as a table")
    .action(async (address, options, command) => {
      validatePublicKey(address);

      const network = getNetwork(command);
      const server = createServer(network);
      const pretty = options.pretty || command.optsWithGlobals().pretty;

      try {
        const account = await server.loadAccount(address);
        printBalances(address, network, account.balances, pretty);
      } catch (error) {
        throw new Error(getBalanceErrorMessage(error, address, network));
      }
    });
}

module.exports = {
  createBalanceCommand
};
