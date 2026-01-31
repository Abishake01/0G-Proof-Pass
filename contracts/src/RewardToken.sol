// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken
 * @notice ERC20 token for tier-based event rewards
 */
contract RewardToken is ERC20, Ownable {
    mapping(address => mapping(uint256 => bool)) public claimed; // wallet => eventId => claimed
    mapping(uint256 => mapping(uint8 => uint256)) public eventRewards; // eventId => tier => amount
    
    uint256 public constant ATTENDEE_REWARD = 10 * 10**18;
    uint256 public constant CONTRIBUTOR_REWARD = 50 * 10**18;
    uint256 public constant CHAMPION_REWARD = 100 * 10**18;
    
    address public nftContract; // ProofOfAttendanceNFT address
    
    event RewardClaimed(address indexed user, uint256 indexed eventId, uint256 amount, uint8 tier);
    
    modifier onlyNFTContract() {
        require(msg.sender == nftContract, "Only NFT contract");
        _;
    }
    
    constructor(address initialOwner) ERC20("0G ProofPass Rewards", "0GREW") Ownable(initialOwner) {
        // Mint initial supply to owner for distribution
        _mint(initialOwner, 1000000 * 10**18);
    }
    
    function setNFTContract(address _nftContract) external onlyOwner {
        nftContract = _nftContract;
    }
    
    function claimReward(uint256 eventId, uint8 tier) external {
        require(!claimed[msg.sender][eventId], "Already claimed");
        require(tier <= 2, "Invalid tier");
        
        uint256 amount = getRewardAmount(tier);
        require(amount > 0, "Invalid reward amount");
        
        claimed[msg.sender][eventId] = true;
        
        _transfer(owner(), msg.sender, amount);
        
        emit RewardClaimed(msg.sender, eventId, amount, tier);
    }
    
    function getRewardAmount(uint8 tier) public pure returns (uint256) {
        if (tier == 0) return ATTENDEE_REWARD;
        if (tier == 1) return CONTRIBUTOR_REWARD;
        if (tier == 2) return CHAMPION_REWARD;
        return 0;
    }
    
    function hasClaimed(address user, uint256 eventId) external view returns (bool) {
        return claimed[user][eventId];
    }
}

