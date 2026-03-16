import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRuns, getEvidence, getControlsCoverage, fetchAwsEvidence } from '../api/api'
import RunHistory from '../components/RunHistory'

function formatRelative(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [runs, setRuns] = useState([])
  const [evidenceCount, setEvidenceCount] = useState(0)
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const load = () => {
    Promise.all([
      getRuns(50),
      getEvidence(1000),
      getControlsCoverage().catch(() => ({ control_ids_with_evidence: [] })),
    ])
      .then(([runsData, evidenceData, coverage]) => {
        setRuns(runsData)
        setEvidenceCount(Array.isArray(evidenceData) ? evidenceData.length : 0)
        setControlIdsWithEvidence(coverage?.control_ids_with_evidence || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleFetchEvidence = () => {
    setFetchError(null)
    setFetching(true)
    fetchAwsEvidence()
      .then(() => load())
      .catch((e) => setFetchError(e.response?.data?.detail || e.message))
      .finally(() => setFetching(false))
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <span className="dashboard-error-icon">!</span>
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  const successRuns = runs.filter((r) => r.status === 'success').length
  const successRate = runs.length ? Math.round((successRuns / runs.length) * 100) : 0
  const recentRuns = runs.slice(0, 8)

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1 className="dashboard-hero-title">Compliance evidence at a glance</h1>
          <p className="dashboard-hero-subtitle">
            Collect and view AWS security evidence for SWIFT controls. Run collectors or browse by control.
          </p>
          <div className="dashboard-hero-actions">
            <button
              type="button"
              className="btn-hero"
              onClick={handleFetchEvidence}
              disabled={fetching}
            >
              {fetching ? (
                <>
                  <span className="btn-hero-spinner" />
                  Collecting…
                </>
              ) : (
                'Fetch AWS evidence'
              )}
            </button>
            <Link to="/controls" className="btn-hero-outline">
              View controls
            </Link>
          </div>
          {fetchError && <p className="dashboard-hero-error">{fetchError}</p>}
        </div>
      </section>

      <section className="dashboard-kpis">
        <div className="kpi-card kpi-runs">
          <div className="kpi-icon" aria-hidden>↻</div>
          <div className="kpi-content">
            <span className="kpi-value">{runs.length}</span>
            <span className="kpi-label">Collector runs</span>
          </div>
        </div>
        <div className="kpi-card kpi-evidence">
          <div className="kpi-icon" aria-hidden>◇</div>
          <div className="kpi-content">
            <span className="kpi-value">{evidenceCount}</span>
            <span className="kpi-label">Evidence items</span>
          </div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-icon" aria-hidden>✓</div>
          <div className="kpi-content">
            <span className="kpi-value">{successRate}%</span>
            <span className="kpi-label">Success rate</span>
          </div>
        </div>
        {controlIdsWithEvidence.length > 0 && (
          <div className="kpi-card kpi-controls">
            <div className="kpi-icon" aria-hidden>◉</div>
            <div className="kpi-content">
              <span className="kpi-value">{controlIdsWithEvidence.length}</span>
              <span className="kpi-label">Controls with evidence</span>
            </div>
          </div>
        )}
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card dashboard-recent">
          <div className="dashboard-card-head">
            <h2>Recent runs</h2>
            <Link to="/controls" className="dashboard-card-link">View controls →</Link>
          </div>
          {recentRuns.length === 0 ? (
            <div className="dashboard-empty">
              <p>No runs yet.</p>
              <p>Use <strong>Fetch AWS evidence</strong> above to run collectors.</p>
            </div>
          ) : (
            <ul className="run-list">
              {recentRuns.map((r) => (
                <li key={r.run_id} className="run-list-item">
                  <span className={`run-status run-status-${r.status}`} title={r.status} />
                  <span className="run-meta">
                    {formatRelative(r.in_time || r.execution_time)} · {r.evidence_count ?? 0} items
                  </span>
                  <span className="run-trigger">{r.trigger_type || '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-card dashboard-actions">
          <h2>Quick links</h2>
          <nav className="quick-links">
            <Link to="/evidence" className="quick-link">
              <span className="quick-link-title">Evidence</span>
              <span className="quick-link-desc">Browse all collected evidence</span>
            </Link>
            <Link to="/controls" className="quick-link">
              <span className="quick-link-title">Controls</span>
              <span className="quick-link-desc">View controls and fetch by control</span>
            </Link>
          </nav>
        </section>
      </div>

      <section className="dashboard-card dashboard-runs-full">
        <h2>Run history</h2>
        <RunHistory runs={runs} />
      </section>
    </div>
  )
}
