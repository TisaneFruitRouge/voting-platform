import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Ballot", () => {
  const proposals = ["Alice", "Bob", "Charlie"];

  async function deployBallot() {
    const [initiator, voter1, voter2, voter3] = await ethers.getSigners();
    const ballot = await ethers.deployContract("Ballot", [
      initiator.address,
      proposals,
    ]);
    return { ballot, initiator, voter1, voter2, voter3 };
  }

  describe("Voting", () => {
    it("Should allow a voter to vote", async () => {
      const { ballot, voter1 } = await deployBallot();

      await expect(ballot.connect(voter1).vote(0)).to.not.be.revert(ethers);
    });

    it("Should revert if a voter votes twice", async () => {
      const { ballot, voter1 } = await deployBallot();

      await ballot.connect(voter1).vote(0);
      await expect(ballot.connect(voter1).vote(0)).to.be.revertedWith(
        "Voter already voted"
      );
    });

    it("Should revert for an invalid proposal index", async () => {
      const { ballot, voter1 } = await deployBallot();

      await expect(ballot.connect(voter1).vote(4)).to.be.revertedWith(
        "Invalid proposal index"
      );
    });

    it("Should revert if the vote has ended", async () => {
      const { ballot, voter1 } = await deployBallot();

      await ballot.endVote();
      await expect(ballot.connect(voter1).vote(0)).to.be.revertedWith(
        "Vote has already ended"
      );
    });
  });

  describe("Ending the vote", () => {
    it("Should only allow the initiator to end the vote", async () => {
      const { ballot, voter1 } = await deployBallot();

      await expect(ballot.connect(voter1).endVote()).to.be.revertedWith(
        "Only the initiator can end the vote"
      );
    });

    it("Should return the correct winner", async () => {
      const { ballot, voter1 } = await deployBallot();

      await ballot.connect(voter1).vote(0);
      await ballot.endVote();
      const result = await ballot.connect(voter1).getResults();
      expect(result[0]).to.equal(proposals[0]);
    });

    it("Should handle ties", async () => {
      const { ballot, voter1, voter2 } = await deployBallot();

      await ballot.connect(voter1).vote(0);
      await ballot.connect(voter2).vote(1);
      await ballot.endVote();
      const result = await ballot.connect(voter1).getResults();
      expect(result.length).to.equal(2);
    });
  });
});
