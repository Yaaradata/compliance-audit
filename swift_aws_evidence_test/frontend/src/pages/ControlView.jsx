import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getControls, getControl, getEvidenceContent, getControlsCoverage, submitEvidence, fetchAwsEvidence } from '../api/api'

export default function ControlView() {
  const { controlId } = useParams()
  const [controls, setControls] = useState([])
  const [selectedControl, setSelectedControl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contentModal, setContentModal] = useState(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [controlIdsWithEvidence, setControlIdsWithEvidence] = useState([])
  const [manualForm, setManualForm] = useState({ item_code: '', contentJson: '{}' })
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualError, setManualError] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    getControls()
      .then((data) => setControls(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
    getControlsCoverage()
      .then((d) => setControlIdsWithEvidence(d.control_ids_with_evidence || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!controlId) {
      setSelectedControl(null)
      setLoading(false)
      return
    }
    setLoading(true)
    getControl(controlId)
      .then(setSelectedControl)
      .catch(() => setSelectedControl(null))
      .finally(() => setLoading(false))
  }, [controlId])

  const refreshControl = () => {
    if (controlId) {
      getControl(controlId).then(setSelectedControl)
      getControlsCoverage().then((d) => setControlIdsWithEvidence(d.control_ids_with_evidence || []))
    }
  }

  const handleFetchAwsEvidence = () => {
    setFetchError(null)
    setFetching(true)
    fetchAwsEvidence()
      .then(() => refreshControl())
      .catch((e) => setFetchError(e.response?.data?.detail || e.message))
      .finally(() => setFetching(false))
  }

  const handleSubmitManual = () => {
    let content
    try {
      content = JSON.parse(manualForm.contentJson || '{}')
    } catch {
      setManualError('Invalid JSON')
      return
    }
    const itemCode = (manualForm.item_code || '').trim() || (selectedControl?.required_evidence_items?.[0]?.item_code) || 'H9'
    setManualError(null)
    setManualSubmitting(true)
    submitEvidence({
      control_id: controlId,
      item_code: itemCode,
      content,
      evidence_type: 'manual',
      source_system: 'manual',
    })
      .then(() => {
        setManualForm({ item_code: itemCode, contentJson: '{}' })
        refreshControl()
      })
      .catch((e) => setManualError(e.response?.data?.detail || e.message))
      .finally(() => setManualSubmitting(false))
  }

  if (loading) return <div className="card">Loading...</div>
  if (error) return <div className="card" style={{ color: '#f87171' }}>Error: {error}</div>

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Control View</h2>
      {controlIdsWithEvidence.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Evidence available for: </span>
          <strong style={{ color: '#38bdf8' }}>{controlIdsWithEvidence.sort().join(', ')}</strong>
        </div>
      )}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>SWIFT controls</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {controls.map((c) => (
            <li key={c.control_id}>
              <Link to={`/control/${c.control_id}`} className={controlId === c.control_id ? 'active' : ''} style={{ display: 'inline-block', padding: '0.5rem 0.75rem', background: controlId === c.control_id ? '#334155' : '#33415566', borderRadius: 6 }}>
                {c.control_id} — {c.control_name || 'Control'}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {selectedControl ? (
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Control: {selectedControl.control_id} — {selectedControl.control_name || 'N/A'}</h2>
            <button type="button" className="btn-fetch" onClick={handleFetchAwsEvidence} disabled={fetching} title="Collect AWS security data (IAM, EC2, CloudTrail, Config, SSM). This control will show new evidence if any collector maps to it.">
              {fetching ? 'Fetching…' : 'Fetch AWS evidence'}
            </button>
          </div>
          {fetchError && <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '0.5rem' }}>{fetchError}</p>}
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '1rem' }}>Required evidence items</h3>
          <ul>
            {(selectedControl.required_evidence_items || []).map((item, i) => (
              <li key={i}>{item.item_code}: {item.evidence_item_name}</li>
            ))}
          </ul>
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '1rem' }}>Collected evidence</h3>
          {(selectedControl.collected_evidence || []).length === 0 ? (
            <div className="empty-evidence-state">
              <p>No evidence collected for this control yet.</p>
              <p className="empty-evidence-hint">
                <strong>Fetch AWS evidence</strong> runs 14 collectors (VPC, IAM, EC2, CloudTrail, Config, SSM, Encryption, MFA/Password, Backup, GuardDuty, Inspector, Logging, Access/Credential). It can populate evidence for many controls (1.1–1.5, 2.1–2.7, 3.1, 4.1–4.2, 5.1–5.4, 6.1–6.5A, 7.1). Enable Config, GuardDuty, Security Hub, Inspector in AWS where needed — see backend <code>collectors/AWS_SETUP.md</code>.
              </p>
              <p className="empty-evidence-hint">All other controls (e.g. 2.10, 7.4A) will show evidence when you add it manually below or when new collectors are added.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Evidence ID</th>
                    <th>Item code</th>
                    <th>Source</th>
                    <th>File hash</th>
                    <th>Collected</th>
                    <th>Content</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedControl.collected_evidence || []).map((e) => (
                    <tr key={e.evidence_id}>
                      <td><code>{e.evidence_id?.slice(0, 8)}…</code></td>
                      <td>{e.item_code}</td>
                      <td>{e.source_system}</td>
                      <td className="hash">{e.file_hash}</td>
                      <td>{e.collected_at ? new Date(e.collected_at).toLocaleString() : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-view-content"
                          onClick={() => {
                            setContentLoading(true)
                            getEvidenceContent(e.evidence_id)
                              .then((content) => setContentModal({ evidenceId: e.evidence_id, content, source: e.source_system }))
                              .catch((err) => setContentModal({ evidenceId: e.evidence_id, error: err.message, source: e.source_system }))
                              .finally(() => setContentLoading(false))
                          }}
                          disabled={contentLoading}
                        >
                          View content
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Add evidence (manual) for any control — so every control can have fetchable content */}
          <div className="manual-evidence-section">
            <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '1.25rem', marginBottom: '0.5rem' }}>Add evidence for this control</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>Submit JSON evidence so this control has content to fetch. Use any structure (e.g. risk register, methodology).</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '560px' }}>
              <label style={{ fontSize: '0.85rem' }}>
                Item code (e.g. H9): <input type="text" value={manualForm.item_code} onChange={(e) => setManualForm((f) => ({ ...f, item_code: e.target.value }))} placeholder={(selectedControl?.required_evidence_items?.[0]?.item_code) || 'H9'} style={{ marginLeft: 4, padding: '4px 8px', width: 80, background: '#334155', border: '1px solid #475569', borderRadius: 4, color: '#e2e8f0' }} />
              </label>
              <textarea value={manualForm.contentJson} onChange={(e) => setManualForm((f) => ({ ...f, contentJson: e.target.value }))} placeholder='{"description": "Risk assessment methodology", "updated": "2026-03-14"}' rows={4} style={{ background: '#334155', border: '1px solid #475569', borderRadius: 4, color: '#e2e8f0', fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', padding: '8px' }} />
              {manualError && <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{manualError}</p>}
              <button type="button" className="btn-view-content" disabled={manualSubmitting} onClick={handleSubmitManual}>{manualSubmitting ? 'Submitting…' : 'Submit evidence'}</button>
            </div>
          </div>

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
      ) : (
        <div className="card" style={{ color: '#94a3b8' }}>Select a control above to see required evidence items and collected evidence.</div>
      )}
    </div>
  )
}
