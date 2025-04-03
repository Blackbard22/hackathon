import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Game from './components/Game'
import SequenceGame from './components/SequenceGame'
import ColorMatch from './components/ColorMatch'
import VerbalFluency from './components/VerbalFluency'
import SpotDifference from './components/SpotDifference'
import Metrics from './components/Metrics'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/sequence-game" element={<SequenceGame />} />
            <Route path="/color-match" element={<ColorMatch />} />
            <Route path="/verbal-fluency" element={<VerbalFluency />} />
            <Route path="/spot-difference" element={<SpotDifference />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
