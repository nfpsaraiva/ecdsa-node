import { useState } from "react";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import server from "./server";
// import JSONbig from "json-bigint";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      // For reference: https://github.com/ethereum/js-ethereum-cryptography#secp256k1-curve
      // For reference: https://gist.github.com/nakov/1dcbe26988e18f7a4d013b65d8803ffc
      // For reference: https://thecodeway.hashnode.dev/building-an-ecdsa-wallet-with-javascript
      // For reference: https://github.com/rrsingh11/ecdsa-node

      // Create message data
      const data = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient
      }

      // Create Message & Signature (discontructed)
      const messageHash = toHex(keccak256(utf8ToBytes(JSON.stringify(data))));
      const signature = secp256k1.sign(messageHash, privateKey);
      const signatureR = signature.r.toString();
      const signatureS = signature.s.toString();
      const signatureRecovery = signature.recovery;

      // Send transaction
      const {
        data: { balance },
      } = await server.post(`send`, {
        data,
        messageHash,
        signatureR,
        signatureS,
        signatureRecovery,
      });

      setBalance(balance);
      
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
