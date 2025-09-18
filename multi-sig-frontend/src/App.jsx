import { useState } from 'react'
import "./App.css"
import '@rainbow-me/rainbowkit/styles.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import CreateWallet from './pages/CreateWallet';
import WalletPage from './pages/WalletPage';
function App() {
  

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/create-wallet' element={<CreateWallet/>}/>
        <Route path='/wallet-page' element={<WalletPage/>}/>
      </Routes>
    </Router>
    
  )
}

export default App;
