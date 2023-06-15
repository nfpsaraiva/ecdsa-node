import { useState } from "react";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      // For reference: https://gist.github.com/nakov/1dcbe26988e18f7a4d013b65d8803ffc

      // Get message hash
      let message = {
        address: address,
        amount: parseInt(sendAmount),
        recipient: recipient
      };
      message = JSON.stringify(message);
      message = Uint8Array.from(message);
      message = keccak256(message);
      toHex(message);
      const messageHash = message;

      console.log(messageHash);
      
      // Generate signature
      const signature = secp256k1.sign(messageHash, privateKey);
      console.log(signature);

      console.log(signature.recoverPublicKey());

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        messageHash,
        signature
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
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
