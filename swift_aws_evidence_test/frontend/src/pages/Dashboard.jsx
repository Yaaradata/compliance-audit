import { useState, useEffect } from 'react'
import { getRuns, getEvidence } from '../api/api'
import RunHistory from '../components/RunHistory'

export default function Dashboard() {
  const [runs, setRuns] = useState([])
  const [evidenceCount, setEvidenceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getRuns(50), getEvidence(1000)])
      .then(([runsData, evidenceData]) => {
        setRuns(runsData)
        setEvidenceCount(Array.isArray(evidenceData) ? evidenceData.length : 0)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card">Loading...</div>
  if (error) return <div className="card" style={{ color: '#f87171' }}>Error: {error}</div>

  const successRuns = runs.filter((r) => r.status === 'success').length

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total collector runs</div>
          <div className="stat">{runs.length}</div>
        </div>
        <div className="card">
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total evidence artifacts</div>
          <div className="stat">{evidenceCount}</div>
        </div>
        <div className="card">
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Successful runs</div>
          <div className="stat">{successRuns}</div>
        </div>
      </div>
      <div className="card">
        <h2>Latest collector runs</h2>
        <RunHistory runs={runs} />
      </div>
    </div>
  )
}
