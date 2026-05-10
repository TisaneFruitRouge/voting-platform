// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Ballot {
    address public initiator;

    string[] public proposals;

    mapping(uint => uint) votes;
    mapping(address => bool) alreadyVoted;

    string[] finalResults;

    bool hasEnded;

    constructor(address _initiator, string[] memory _proposals) {
        initiator = _initiator;
        proposals = _proposals;

        for (uint i = 0; i < proposals.length; i++) {
            votes[i] = 0;
        }
    }

    function vote(uint proposalIndex) public {
        address voter = msg.sender;

        require(!alreadyVoted[voter], "Voter already voted");
        require(proposalIndex < proposals.length, "Invalid proposal index");
        require(hasEnded == false, "Vote has already ended");

        votes[proposalIndex]++;
        alreadyVoted[voter] = true;
    }

    function endVote() public {
        require(hasEnded == false, "Vote has already ended");
        require(msg.sender == initiator, "Only the initiator can end the vote");

        countVotes();
        hasEnded = true;
    }

    function countVotes() internal {
        uint highestVoteCount = 0;

        for (uint i = 0; i < proposals.length; i++) {
            string memory proposal = proposals[i];
            uint numberOfVotes = votes[i];

            if (numberOfVotes == 0) {
                continue;
            } else if (numberOfVotes == highestVoteCount) {
                finalResults.push(proposal);
            } else if (numberOfVotes > highestVoteCount) {
                finalResults = [proposal];
                highestVoteCount = numberOfVotes;
            }
        }
    }

    function getResults() public view returns (string[] memory) {
        require(hasEnded, "Vote has not ended yet");
        return finalResults;
    }
}
