// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.28;

import "./MultiSigWallet.sol";

contract MultiSigFactory {
    address[] public allWallets;
    mapping(address => address[]) public userWallets; // user => wallets they deployed

    event WalletCreated(
        address indexed creator,
        address walletAddress,
        uint256 threshold,
        uint256 timeLock
    );

    function createWallet(
        address[] memory owners,
        uint256 threshold,
        uint256 timeLock
    ) public {
        MultiSigWallet wallet = new MultiSigWallet(owners, threshold, timeLock);
        allWallets.push(address(wallet));
        userWallets[msg.sender].push(address(wallet));
        for (uint i = 0; i < owners.length; i++) {
            userWallets[owners[i]].push(address(wallet));
        }

        emit WalletCreated(msg.sender, address(wallet), threshold, timeLock);
    }

    function getUserWalletCount(address user) public view returns (uint256) {
        return userWallets[user].length;
    }

    function getAllWallets() public view returns (address[] memory) {
        return allWallets;
    }
}
