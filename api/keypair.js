import StellarSdk from "stellar-sdk";

export default async function handler(req, res) {
  const pair = StellarSdk.Keypair.random();
  res.status(200).json({
    publicKey: pair.publicKey(),
    secretKey: pair.secret()
  });
}