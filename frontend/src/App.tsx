import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Ballot from "./contracts/Ballot.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [initiator, setInitiator] = useState<string>("");
  const [proposals, setProposals] = useState<string[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<string>("");
  const [hasEnded, setHasEnded] = useState(false);
  const [status, setStatus] = useState<string>("Loading...");

  useEffect(() => {
    async function loadContract() {
      if (!window.ethereum) {
        setStatus("Install MetaMask to use this app.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setSignerAddress(address);

      const ballotContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Ballot.abi,
        signer,
      );

      setContract(ballotContract);

      const init = await ballotContract.initiator();
      setInitiator(init);

      // Read proposals by iterating until it reverts
      const props: string[] = [];
      let i = 0;
      while (true) {
        try {
          const p = await ballotContract.proposals(i);
          props.push(p);
          i++;
        } catch {
          break;
        }
      }
      setProposals(props);
      if (props.length > 0) {
        setSelectedProposal(props[0]);
      }

      setStatus("");
    }

    loadContract();
  }, []);

  async function handleVote() {
    if (!contract || !selectedProposal) return;
    setStatus("Submitting vote...");
    try {
      const tx = await contract.vote(signerAddress, selectedProposal);
      await tx.wait();
      setStatus("Vote submitted!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setStatus(`Error: ${message}`);
    }
  }

  async function handleEndVote() {
    if (!contract) return;
    setStatus("Ending vote...");
    try {
      const tx = await contract.endVote();
      await tx.wait();
      setHasEnded(true);
      setStatus("Vote ended.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setStatus(`Error: ${message}`);
    }
  }

  const isInitiator =
    signerAddress.toLowerCase() === initiator.toLowerCase() && initiator !== "";

  return (
    <div className="ballot">
      <h1>Ballot</h1>

      {status && <p className="status">{status}</p>}

      {proposals.length > 0 && !hasEnded && (
        <div className="voting-section">
          <h2>Proposals</h2>
          <ul className="proposal-list">
            {proposals.map((p) => (
              <li key={p}>
                <label>
                  <input
                    type="radio"
                    name="proposal"
                    value={p}
                    checked={selectedProposal === p}
                    onChange={() => setSelectedProposal(p)}
                  />
                  {p}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleVote} disabled={!contract}>
            Vote
          </button>
        </div>
      )}

      {hasEnded && <p className="ended">The vote has ended.</p>}

      {isInitiator && !hasEnded && (
        <button className="end-vote-btn" onClick={handleEndVote}>
          End Vote
        </button>
      )}
    </div>
  );
}

export default App;
