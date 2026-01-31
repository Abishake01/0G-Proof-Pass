// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EventRegistry
 * @notice Manages events and attendee check-ins
 */
contract EventRegistry {
    struct Event {
        uint256 id;
        string name;
        string location;
        uint256 startTime;
        uint256 endTime;
        address organizer;
        bool active;
    }

    struct CheckIn {
        address attendee;
        uint256 eventId;
        uint256 timestamp;
        bool verified;
    }

    mapping(uint256 => Event) public events;
    mapping(bytes32 => CheckIn) public checkIns; // hash(eventId, wallet) => CheckIn
    mapping(address => uint256[]) public attendeeEvents; // wallet => eventIds[]
    
    uint256 public eventCount;
    address public nftContract; // ProofOfAttendanceNFT address
    
    event EventCreated(uint256 indexed eventId, string name, address indexed organizer);
    event AttendeeCheckedIn(uint256 indexed eventId, address indexed attendee, uint256 timestamp);
    
    modifier onlyOrganizer(uint256 eventId) {
        require(events[eventId].organizer == msg.sender, "Not event organizer");
        _;
    }
    
    modifier onlyNFTContract() {
        require(msg.sender == nftContract, "Only NFT contract");
        _;
    }
    
    function setNFTContract(address _nftContract) external {
        require(nftContract == address(0), "NFT contract already set");
        nftContract = _nftContract;
    }
    
    function createEvent(
        string memory name,
        string memory location,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Event name required");
        require(startTime < endTime, "Invalid time range");
        
        eventCount++;
        uint256 eventId = eventCount;
        
        events[eventId] = Event({
            id: eventId,
            name: name,
            location: location,
            startTime: startTime,
            endTime: endTime,
            organizer: msg.sender,
            active: true
        });
        
        emit EventCreated(eventId, name, msg.sender);
        return eventId;
    }
    
    function checkIn(uint256 eventId) external {
        require(events[eventId].active, "Event not active");
        require(block.timestamp >= events[eventId].startTime, "Event not started");
        require(block.timestamp <= events[eventId].endTime, "Event ended");
        
        bytes32 checkInKey = keccak256(abi.encodePacked(eventId, msg.sender));
        require(!checkIns[checkInKey].verified, "Already checked in");
        
        checkIns[checkInKey] = CheckIn({
            attendee: msg.sender,
            eventId: eventId,
            timestamp: block.timestamp,
            verified: true
        });
        
        attendeeEvents[msg.sender].push(eventId);
        
        emit AttendeeCheckedIn(eventId, msg.sender, block.timestamp);
    }
    
    function isCheckedIn(uint256 eventId, address attendee) external view returns (bool) {
        bytes32 checkInKey = keccak256(abi.encodePacked(eventId, attendee));
        return checkIns[checkInKey].verified;
    }
    
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }
    
    function getAttendeeEvents(address attendee) external view returns (uint256[] memory) {
        return attendeeEvents[attendee];
    }
}

