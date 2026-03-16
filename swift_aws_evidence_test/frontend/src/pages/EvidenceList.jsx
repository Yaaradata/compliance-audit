import { useState, useEffect } from 'react'
import { getEvidence, getEvidenceContent } from '../api/api'
import EvidenceTable from '../components/EvidenceTable'

export default function EvidenceList() {
  const [evidence, setEvidence] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contentModal, setContentModal] = useState(null)
  const [contentLoading, setContentLoading] = useState(false)

  useEffect(() => {
    getEvidence(200)
      .then(setEvidence)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleViewContent = (e) => {
    setContentLoading(true)
    getEvidenceContent(e.evidence_id)
      .then((content) => setContentModal({ content, source: e.source_system }))
      .catch((err) => setContentModal({ error: err.message, source: e.source_system }))
      .finally(() => setContentLoading(false))
  }

  if (loading) return <div className="page-loading">Loading evidence…</div>
  if (error) return <div className="page-error">Error: {error}</div>

  return (
    <div className="page">
      <header className="page-header">
        <h1>Evidence</h1>
        <p className="page-subtitle">Collected AWS security evidence by item and control.</p>
      </header>
      <EvidenceTable data={Array.isArray(evidence) ? evidence : []} onViewContent={handleViewContent} />
      {contentModal && (
        <div className="modal-overlay" onClick={() => setContentModal(null)} role="presentation">
          <div className="modal-content" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h3>Evidence content</h3>
              <button type="button" className="modal-close" onClick={() => setContentModal(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {contentModal.error ? (
                <p className="modal-error">{contentModal.error}</p>
              ) : (
                <pre className="evidence-json">{JSON.stringify(contentModal.content, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
