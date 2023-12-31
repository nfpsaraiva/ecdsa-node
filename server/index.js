const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const {secp256k1} = require("ethereum-cryptography/secp256k1");
const JSONBig = require("json-bigint");
const {toHex} = require("ethereum-cryptography/utils");


app.use(cors());
app.use(express.json());

/**
private key: 00ba3018cf7e66485221366668a56486f456cc4b9c563c8f843995055dd0b2fe
public key: 02680b33a78e322a77fa468dbc8432cb0a214ce7fec6bf03479170875a1f2723a4

private key: f8d5ad66f20f0be6f01ee7b9b99ae132ac6ba858db3da0ffb522de66eaff2ea9
public key: 027ea31e06befeb8d5cf6225ef264d7dbf650dde82400a0adeba32c8b78bd009fc

private key: 175184b4aed06ff6140cd5c2664d39d69f613e86d8da2f901dcc1d81945cffd7
public key: 03e23d5e9436c54f6579fbfabf54492efb6cc7a1d748055f35c27b6583cc471585
 */

const balances = {
  "02680b33a78e322a77fa468dbc8432cb0a214ce7fec6bf03479170875a1f2723a4": 100,
  "027ea31e06befeb8d5cf6225ef264d7dbf650dde82400a0adeba32c8b78bd009fc": 50,
  "03e23d5e9436c54f6579fbfabf54492efb6cc7a1d748055f35c27b6583cc471585": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  
  // Get request 
  const { data, messageHash, signatureR, signatureS, signatureRecovery } = req.body;
  const { sender, amount, recipient } = data;

  // Reconstruct signature
  const signature = new secp256k1.Signature(BigInt(signatureR), BigInt(signatureS), signatureRecovery);

  // Validate sender
  const recoveredPublicKey = signature.recoverPublicKey(messageHash).toHex();
  if (recoveredPublicKey !== sender) {
    res.status(400).send( {message: "Invalid sender" });
  }

  // Validate signature
  const isSignatureValid = secp256k1.verify(signature, messageHash, sender);
  if (!isSignatureValid) {
    res.status(400).send({ message: "Invalid signature"});
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
