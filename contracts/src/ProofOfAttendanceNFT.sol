// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfAttendanceNFT
 * @notice Dynamic NFT badges for event attendance with upgradeable tiers
 */
contract ProofOfAttendanceNFT is ERC721, ERC721URIStorage, Ownable {
    enum Tier { Attendee, Contributor, Champion }
    
    struct Badge {
        uint256 eventId;
        string eventName;
        string eventDate;
        string location;
        Tier tier;
        uint256 contributionScore;
        string storageHash; // 0G Storage reference
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(bytes32 => uint256) public eventAttendeeToToken; // hash(eventId, wallet) => tokenId
    mapping(address => uint256[]) public ownerTokens; // owner => tokenIds[]
    
    uint256 private _tokenIdCounter;
    address public eventRegistry;
    
    event BadgeMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed eventId);
    event BadgeUpgraded(uint256 indexed tokenId, Tier newTier, uint256 newScore);
    
    modifier onlyEventRegistry() {
        require(msg.sender == eventRegistry, "Only EventRegistry");
        _;
    }
    
    constructor(address initialOwner) ERC721("0G ProofPass", "0GPASS") Ownable(initialOwner) {
        _tokenIdCounter = 1;
    }
    
    function setEventRegistry(address _eventRegistry) external onlyOwner {
        eventRegistry = _eventRegistry;
    }
    
    function mintBadge(
        address to,
        uint256 eventId,
        string memory eventName,
        string memory eventDate,
        string memory location
    ) external onlyEventRegistry returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(eventId, to));
        require(eventAttendeeToToken[key] == 0, "Badge already minted");
        
        uint256 tokenId = _tokenIdCounter++;
        
        badges[tokenId] = Badge({
            eventId: eventId,
            eventName: eventName,
            eventDate: eventDate,
            location: location,
            tier: Tier.Attendee,
            contributionScore: 0,
            storageHash: ""
        });
        
        eventAttendeeToToken[key] = tokenId;
        ownerTokens[to].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit BadgeMinted(tokenId, to, eventId);
        return tokenId;
    }
    
    function upgradeBadge(
        uint256 tokenId,
        Tier tier,
        uint256 score,
        string memory storageHash
    ) external onlyEventRegistry {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        badges[tokenId].tier = tier;
        badges[tokenId].contributionScore = score;
        badges[tokenId].storageHash = storageHash;
        
        emit BadgeUpgraded(tokenId, tier, score);
    }
    
    function getBadge(uint256 tokenId) external view returns (Badge memory) {
        return badges[tokenId];
    }
    
    function getOwnerBadges(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Badge memory badge = badges[tokenId];
        string memory tierName = tierToString(badge.tier);
        
        // Generate JSON metadata
        return string(abi.encodePacked(
            '{"name":"0G ProofPass #', _toString(tokenId), '",',
            '"description":"Proof of Attendance NFT for ', badge.eventName, '",',
            '"attributes":[',
            '{"trait_type":"Event","value":"', badge.eventName, '"},',
            '{"trait_type":"Date","value":"', badge.eventDate, '"},',
            '{"trait_type":"Location","value":"', badge.location, '"},',
            '{"trait_type":"Tier","value":"', tierName, '"},',
            '{"trait_type":"Score","value":', _toString(badge.contributionScore), '}',
            ']}'
        ));
    }
    
    function tierToString(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.Attendee) return "Attendee";
        if (tier == Tier.Contributor) return "Contributor";
        if (tier == Tier.Champion) return "Champion";
        return "Unknown";
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

