// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Ballot {
    address public initiator;

    string[] public proposals;

    mapping(string => uint) votes;
    mapping(address => bool) alreadyVoted;

    string[] finalResults;

    bool hasEnded;

    constructor(address _initiator, string[] memory _proposals) {
        initiator = _initiator;
        proposals = _proposals;

        for (uint i = 0; i < proposals.length; i++) {
            votes[proposals[i]] = 0;
        }
    }

    function vote(address voter, string calldata proposal) public {
        require(!alreadyVoted[voter], "Voter already voted");
        require(isInProposals(proposal), "Wrong proposal");
        require(hasEnded == false, "Vote has already ended");

        votes[proposal]++;
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
            uint numberOfVotes = votes[proposal];

            if (numberOfVotes == 0) continue;
            if (numberOfVotes == highestVoteCount) {
                finalResults.push(proposal);
            }
            if (numberOfVotes > highestVoteCount) {
                finalResults = [proposal];
            }
        }
    }

    function compareStrings(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function isInProposals(string calldata p) internal view returns (bool) {
        for (uint256 i = 0; i < proposals.length; i++) {
            if (compareStrings(proposals[i], p)) return true;
        }
        return false;
    }
}
