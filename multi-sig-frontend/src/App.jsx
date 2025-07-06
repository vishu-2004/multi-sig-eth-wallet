import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "./App.css"
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';


function App() {
  

  return (
    <div className='flex'><p className='text-amber-700 text-7xl'>hiiiiiiiii</p>
      <ConnectButton/>
    </div>
  )
}

export default App;
