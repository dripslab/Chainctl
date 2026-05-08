const { Command } = require("commander");
const StellarSdk = require("stellar-sdk");

const HORIZON_URLS = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org"
};

const NETWORK_PASSPHRASES = {
  testnet: StellarSdk.Networks.TESTNET,
  mainnet: StellarSdk.Networks.PUBLIC
};

function getNetwork(program) {
  const network = program.optsWithGlobals().network;

  if (!HORIZON_URLS[network]) {
    throw new Error(`Unsupported network "${network}". Use testnet or mainnet.`);
  }

  return network;
}

function validateSecretKey(secretKey) {
  if (!StellarSdk.StrKey.isValidEd25519SecretSeed(secretKey || "")) {
    throw new Error("Invalid sender secret key. It should start with S and be a valid Stellar secret seed.");
  }
}

function validatePublicKey(address) {
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(address || "")) {
    throw new Error("Invalid destination public key. It should start with G and be a valid Stellar public key.");
  }
}

function validateAmount(amount) {
  if (!/^\d+(\.\d{1,7})?$/.test(amount || "") || Number(amount) <= 0) {
    throw new Error("Invalid amount. Use a positive XLM amount with up to 7 decimal places, for example 10 or 0.25.");
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

function getTransactionCodes(error) {
  return error.response?.data?.extras?.result_codes || {};
}

function getSendErrorMessage(error, network) {
  const status = error.response?.status;
  const codes = getTransactionCodes(error);
  const transactionCode = codes.transaction;
  const operationCodes = codes.operations || [];

  if (status === 404) {
    return `Sender account was not found on ${network}. Make sure it is funded and that you selected the right network.`;
  }

  if (transactionCode === "tx_insufficient_balance" || operationCodes.includes("op_underfunded")) {
    return "Payment failed: the sender does not have enough XLM to cover the amount, fee, and minimum reserve.";
  }

  if (operationCodes.includes("op_no_destination")) {
    return `Payment failed: the destination account does not exist on ${network}. Fund it first, then try again.`;
  }

  if (operationCodes.includes("op_under_dest_min")) {
    return "Payment failed: the destination account would be below its minimum reserve.";
  }

  if (operationCodes.includes("op_no_trust")) {
    return "Payment failed: the destination account does not trust this asset.";
  }

  if (transactionCode === "tx_bad_seq") {
    return "Payment failed because the sender sequence number changed. Please try again.";
  }

  if (transactionCode || operationCodes.length > 0) {
    return `Payment failed: Horizon rejected the transaction (${[transactionCode, ...operationCodes].filter(Boolean).join(", ")}).`;
  }

  if (status) {
    return `Payment failed: Horizon returned ${status}: ${getHorizonDetail(error)}`;
  }

  if (error.name === "TypeError" || error.code || !error.message) {
    return `Unable to reach Horizon for ${network}. Check your internet connection and try again.`;
  }

  return `Payment failed: ${error.message}`;
}

function printResult(payload, pretty) {
  if (pretty) {
    console.log("Payment sent.");
    console.log(`Transaction: ${payload.hash}`);
    console.log(`Ledger: ${payload.ledger}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

function createSendCommand() {
  return new Command("send")
    .description("Send XLM from one account to another")
    .requiredOption("--from <secret>", "Secret key of sender")
    .requiredOption("--to <address>", "Public key of recipient")
    .requiredOption("--amount <amount>", "Amount of XLM to send")
    .option("--memo <memo>", "Text memo to include with the payment")
    .option("--pretty", "Print a short human-readable result")
    .action(async (options, command) => {
      validateSecretKey(options.from);
      validatePublicKey(options.to);
      validateAmount(options.amount);

      const network = getNetwork(command);
      const server = createServer(network);
      const sourceKeypair = StellarSdk.Keypair.fromSecret(options.from);
      const pretty = options.pretty || command.optsWithGlobals().pretty;

      try {
        const source = await server.loadAccount(sourceKeypair.publicKey());
        const fee = await server.fetchBaseFee();
        let builder = new StellarSdk.TransactionBuilder(source, {
          fee: String(fee),
          networkPassphrase: NETWORK_PASSPHRASES[network]
        })
          .addOperation(
            StellarSdk.Operation.payment({
              destination: options.to,
              asset: StellarSdk.Asset.native(),
              amount: options.amount
            })
          )
          .setTimeout(30);

        if (options.memo) {
          builder = builder.addMemo(StellarSdk.Memo.text(options.memo));
        }

        const transaction = builder.build();
        transaction.sign(sourceKeypair);

        const result = await server.submitTransaction(transaction);
        printResult(
          {
            hash: result.hash,
            ledger: result.ledger,
            network,
            from: sourceKeypair.publicKey(),
            to: options.to,
            amount: options.amount
          },
          pretty
        );
      } catch (error) {
        throw new Error(getSendErrorMessage(error, network));
      }
    });
}

module.exports = {
  createSendCommand
};
