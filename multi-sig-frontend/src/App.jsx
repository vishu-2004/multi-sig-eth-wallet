import { useState } from "react";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateWallet from "./pages/CreateWallet";
import WalletPage from "./pages/WalletPage";
import TransactionDetails from "./pages/TransactionDetails";
import UserProfile from "./pages/UserProfile";
import UserWallets from "./pages/UserWallets";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-wallet" element={<CreateWallet />} />
        <Route path="/wallet-page/:walletAddress" element={<WalletPage />} />
        <Route path="/transaction-details/:walletAddress/:transactionId" element={<TransactionDetails />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/user-wallets" element={<UserWallets />} />
      </Routes>
    </Router>
  );
}

export default App;
