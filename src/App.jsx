import { useEffect } from 'react'
import { useSimulation } from './store/useSimulation.js'
import Onboarding from './components/Onboarding.jsx'
import TopBar from './components/TopBar.jsx'
import AgentPanel from './components/AgentPanel.jsx'
import CityMap from './components/CityMap.jsx'
import WorldPanel from './components/WorldPanel.jsx'
import BottomBar from './components/BottomBar.jsx'
import './App.css'

export default function App() {
  const apiKey = useSimulation(s => s.apiKey)
  const setApiKey = useSimulation(s => s.setApiKey)

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      chrome.storage.sync.get('nvidia_api_key', ({ nvidia_api_key }) => {
        if (nvidia_api_key) setApiKey(nvidia_api_key)
      })
    }
  }, [])

  if (!apiKey) return <Onboarding />

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#1a1a2e', color: '#eaeaea',
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <AgentPanel />
        <CityMap />
        <WorldPanel />
      </div>
      <BottomBar />
    </div>
  )
}
