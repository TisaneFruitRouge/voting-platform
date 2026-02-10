import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BallotModule", (m) => {
  const initiator = m.getAccount(0);
  const ballot = m.contract("Ballot", [
    initiator,
    ["Proposal A", "Proposal B", "Proposal C"],
  ]);

  return { ballot };
});
