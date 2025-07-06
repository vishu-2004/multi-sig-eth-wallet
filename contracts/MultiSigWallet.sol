// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.28;

contract MultiSigWallet {
    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 approvals;
        uint256 timestamp;
        mapping(address => bool) approvedBy;
    }

    address[] public walletOwners;

    Transaction[] public transactions;
    mapping(address => bool) isOwner;
    uint256 public minimumCount = 3;
    uint256 public timeLockDelay = 0;

    constructor(address[] memory owners, uint256 minCount, uint256 timeLock) {
        require(
            owners.length >= minCount,
            "Must have atleast minimum count address"
        );
        for (uint i = 0; i < owners.length; i++) {
            //check for duplicates
            require(
                isOwner[owners[i]] == false,
                "No duplicate address allowed"
            );

            //check for invalid address
            require(owners[i] != address(0), "Invalid address not allowed");

            walletOwners.push(owners[i]);
            isOwner[owners[i]] = true;
        }
        minimumCount = minCount;
        timeLockDelay = timeLock;
    }

    event TransactionSubmitted(uint256 tx_id, address indexed submitter);
    event TransactionApproved(uint256 tx_id, address indexed approver);
    event TransactionExecuted(uint256 tx_id, address indexed executer);
    event ApprovalRevoked(uint256 tx_id, address indexed revoker);

    modifier onlyOwner() {
        require(isOwner[msg.sender] == true, "Not an Owner");
        _;
    }

    receive() external payable {}

    fallback() external payable {}

    function submitTransaction(
        address to,
        uint256 val,
        bytes memory data
    ) public onlyOwner {
        require(to != address(0), "Invalid destination address");
        require(val != 0, "Invalid value");

        Transaction storage newTx = transactions.push();
        newTx.destination = to;
        newTx.value = val;
        newTx.data = data;
        newTx.approvals = 0;
        newTx.executed = false;
        newTx.timestamp = block.timestamp;
        emit TransactionSubmitted(transactions.length - 1,msg.sender);
    }

    function approveTransaction(uint256 tx_id) public onlyOwner {
        require(tx_id < transactions.length, "transaction id out of bounds");
        Transaction storage tr = transactions[tx_id];
        require(!tr.approvedBy[msg.sender], "Already Approved");

        tr.approvals++;
        tr.approvedBy[msg.sender] = true;

        emit TransactionApproved(tx_id, msg.sender);
    }

    function executeTransaction(uint256 tx_id) public onlyOwner {
        require(tx_id < transactions.length, "Transaction id out of bounds");
        require(!transactions[tx_id].executed, "Transaction already executed");
        require(
            block.timestamp >= transactions[tx_id].timestamp + timeLockDelay,
            "Timelock not expired"
        );

        require(
            transactions[tx_id].approvals >= minimumCount,
            "Not enough approvals"
        );
        require(address(this).balance >= transactions[tx_id].value, "Insufficient wallet balance");


        
        (bool success, ) = transactions[tx_id].destination.call{
            value: transactions[tx_id].value
        }(transactions[tx_id].data);
        require(success, "Transaction failed");
        transactions[tx_id].executed = true;
        emit TransactionExecuted(tx_id, msg.sender);
    }

    function revokeApproval(uint256 tx_id) public onlyOwner {
        require(tx_id < transactions.length, "Transaction id out of bounds");
        require(!transactions[tx_id].executed, "Transaction already executed");
        require(
            transactions[tx_id].approvedBy[msg.sender],
            "You haven't approved the transaction"
        );

        transactions[tx_id].approvedBy[msg.sender] = false;
        transactions[tx_id].approvals--;

        emit ApprovalRevoked(tx_id, msg.sender);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTransactionStatus(
        uint256 tx_id
    ) public view returns (uint256, bool) {
        require(tx_id < transactions.length, "Transaction id out of bounds");
        return (transactions[tx_id].approvals, transactions[tx_id].executed);
    }

    function getOwners() public view returns (address[] memory) {
        return walletOwners;
    }

    function getThreshold() public view returns (uint256) {
        return minimumCount;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransactionDetails(
        uint256 tx_id
    )
        public
        view
        returns (
            address destination,
            uint256 value,
            bytes memory data,
            uint256 approvals,
            bool executed
        )
    {
        require(tx_id < transactions.length, "Transaction ID out of bounds");
        Transaction storage txData = transactions[tx_id];
        return (
            txData.destination,
            txData.value,
            txData.data,
            txData.approvals,
            txData.executed
        );
    }

    function getConfirmationCount(uint256 tx_id) public view returns (uint256) {
        require(tx_id < transactions.length, "Transaction ID out of bounds");
        return transactions[tx_id].approvals;
    }

    function getTransactionApprovers(
        uint tx_id
    ) public view returns (address[] memory) {
        require(tx_id < transactions.length, "Transaction ID out of bounds");

        uint count = 0;
        for (uint i = 0; i < walletOwners.length; i++) {
            if (transactions[tx_id].approvedBy[walletOwners[i]]) {
                count++;
            }
        }

        address[] memory confirmedAddresses = new address[](count);
        uint index = 0;
        for (uint i = 0; i < walletOwners.length; i++) {
            address owner = walletOwners[i];
            if (transactions[tx_id].approvedBy[owner]) {
                confirmedAddresses[index] = owner;
                index++;
            }
        }

        return confirmedAddresses;
    }

    function isApproved(
        uint256 txId,
        address approver
    ) public view returns (bool) {
        return transactions[txId].approvedBy[approver];
    }
}
