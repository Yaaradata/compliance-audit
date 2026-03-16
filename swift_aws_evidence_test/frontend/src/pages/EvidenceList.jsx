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
      .then((content) => setContentModal({ evidenceId: e.evidence_id, content, source: e.source_system }))
      .catch((err) => setContentModal({ evidenceId: e.evidence_id, error: err.message, source: e.source_system }))
      .finally(() => setContentLoading(false))
  }

  if (loading) return <div className="card">Loading...</div>
  if (error) return <div className="card" style={{ color: '#f87171' }}>Error: {error}</div>

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Evidence List</h2>
      <EvidenceTable data={Array.isArray(evidence) ? evidence : []} onViewContent={handleViewContent} />
      {contentModal && (
        <div className="modal-overlay" onClick={() => setContentModal(null)} role="presentation">
          <div className="modal-content" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h3>Evidence content — {contentModal.source}</h3>
              <button type="button" className="modal-close" onClick={() => setContentModal(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {contentModal.error ? (
                <p style={{ color: '#f87171' }}>{contentModal.error}</p>
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
