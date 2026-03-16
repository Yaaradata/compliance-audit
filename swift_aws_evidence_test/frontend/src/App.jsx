import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import EvidenceList from './pages/EvidenceList'
import ControlView from './pages/ControlView'

function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <NavLink to="/" className="app-brand">
          <span className="app-logo">SWIFT</span>
          <span className="app-title">AWS Evidence</span>
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/evidence">Evidence</NavLink>
          <NavLink to="/controls">Controls</NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/evidence" element={<EvidenceList />} />
          <Route path="/controls" element={<ControlView />} />
          <Route path="/control/:controlId" element={<ControlView />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
