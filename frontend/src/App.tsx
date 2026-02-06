import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Counter from "./contracts/Counter.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [count, setCount] = useState<number | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    async function loadContract() {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const counterContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Counter.abi,
        signer,
      );

      const value = await counterContract.x();
      setCount(Number(value));
      setContract(counterContract);
    }

    loadContract();
  }, []);

  async function handleIncrement() {
    if (!contract) return;

    const tx = await contract.inc();
    await tx.wait();

    const updated = await contract.x();
    setCount(Number(updated));
  }

  return (
    <div>
      <h1>Counter: {count ?? "Loading..."}</h1>
      <button onClick={handleIncrement} disabled={!contract}>
        Increment
      </button>
    </div>
  );
}

export default App;
