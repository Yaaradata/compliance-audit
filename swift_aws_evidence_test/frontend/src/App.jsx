import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import EvidenceList from './pages/EvidenceList'
import ControlView from './pages/ControlView'

function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>SWIFT AWS Evidence Test</h1>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/evidence" className={({ isActive }) => (isActive ? 'active' : '')}>Evidence List</NavLink>
          <NavLink to="/controls" className={({ isActive }) => (isActive ? 'active' : '')}>Control View</NavLink>
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
