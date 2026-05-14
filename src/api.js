const express = require("express");
const StellarSdk = require("stellar-sdk");

const HORIZON_URLS = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org"
};

const NETWORK_PASSPHRASES = {
  testnet: StellarSdk.Networks.TESTNET,
  mainnet: StellarSdk.Networks.PUBLIC
};

function createServer(network) {
  return new StellarSdk.Horizon.Server(HORIZON_URLS[network]);
}

async function generateKeypair() {
  const pair = StellarSdk.Keypair.random();
  return { publicKey: pair.publicKey(), secretKey: pair.secret() };
}

async function getBalance(address, network) {
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("Invalid Stellar public key");
  }
  const server = createServer(network);
  const account = await server.loadAccount(address);
  return account.balances;
}

async function fundTestnet(address) {
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("Invalid Stellar public key");
  }
  const url = new URL("https://friendbot.stellar.org");
  url.searchParams.set("addr", address);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Friendbot request failed");
  }
  return response.json();
}

async function sendPayment(fromSecret, toAddress, amount, network, memo) {
  const server = createServer(network);
  const sourceKeypair = StellarSdk.Keypair.fromSecret(fromSecret);
  const source = await server.loadAccount(sourceKeypair.publicKey());
  const fee = await server.fetchBaseFee();

  let builder = new StellarSdk.TransactionBuilder(source, {
    fee: String(fee),
    networkPassphrase: NETWORK_PASSPHRASES[network]
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toAddress,
        asset: StellarSdk.Asset.native(),
        amount: amount
      })
    )
    .setTimeout(30);

  if (memo) {
    builder = builder.addMemo(StellarSdk.Memo.text(memo));
  }

  const transaction = builder.build();
  transaction.sign(sourceKeypair);
  const result = await server.submitTransaction(transaction);
  return result;
}

function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/keypair", async (req, res) => {
    try {
      const result = await generateKeypair();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const network = req.query.network || "testnet";
      const balances = await getBalance(address, network);
      res.json({ address, network, balances });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/friendbot", async (req, res) => {
    try {
      const { address } = req.body;
      const result = await fundTestnet(address);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/send", async (req, res) => {
    try {
      const { from, to, amount, network = "testnet", memo } = req.body;
      const result = await sendPayment(from, to, amount, network, memo);
      res.json({
        hash: result.hash,
        ledger: result.ledger,
        network,
        from: StellarSdk.Keypair.fromSecret(from).publicKey(),
        to,
        amount
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}

module.exports = createApp();