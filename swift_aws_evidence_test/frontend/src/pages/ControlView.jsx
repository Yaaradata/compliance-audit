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

  if (loading) return <div className="page-loading">Loading…</div>
  if (error) return <div className="page-error">Error: {error}</div>

  const collected = selectedControl?.collected_evidence || []

  return (
    <div className="page">
      <header className="page-header">
        <h1>Controls</h1>
        <p className="page-subtitle">SWIFT controls and their evidence. Fetch AWS evidence or add manual evidence.</p>
      </header>

      {controlIdsWithEvidence.length > 0 && (
        <div className="card card-badge">
          <span className="label">Evidence available for:</span>
          <strong>{controlIdsWithEvidence.sort().join(', ')}</strong>
        </div>
      )}

      <div className="card card-section">
        <h2 className="section-title">Select control</h2>
        <div className="control-chips">
          {controls.map((c) => (
            <Link
              key={c.control_id}
              to={`/control/${c.control_id}`}
              className={`chip ${controlId === c.control_id ? 'chip-active' : ''}`}
            >
              {c.control_id} — {c.control_name || 'Control'}
            </Link>
          ))}
        </div>
      </div>

      {selectedControl ? (
        <div className="card card-section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Control {selectedControl.control_id}</h2>
              <p className="section-desc">{selectedControl.control_name || '—'}</p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={handleFetchAwsEvidence}
              disabled={fetching}
              title="Run AWS collectors to gather evidence for this and other controls."
            >
              {fetching ? 'Fetching…' : 'Fetch AWS evidence'}
            </button>
          </div>
          {fetchError && <p className="inline-error">{fetchError}</p>}

          {(selectedControl.aws_calls?.aws_apis?.length > 0) && (
            <>
              <h3 className="subsection-title">AWS calls for this control</h3>
              <p className="aws-calls-desc">These AWS APIs are used to collect evidence for the required items above.</p>
              <div className="aws-calls-list">
                {selectedControl.aws_calls.aws_apis.map((api) => (
                  <span key={api} className="aws-api-tag"><code>{api}</code></span>
                ))}
              </div>
              {(selectedControl.aws_calls.by_evidence_item?.length > 0) && (
                <details className="aws-calls-by-item">
                  <summary>By evidence item</summary>
                  <ul className="aws-by-item-list">
                    {selectedControl.aws_calls.by_evidence_item.map((item) => (
                      <li key={item.item_code}>
                        <span className="item-code">{item.item_code}</span> {item.evidence_item_name}
                        <ul className="aws-by-item-apis">
                          {item.apis.map((api) => (
                            <li key={api}><code>{api}</code></li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}

          <h3 className="subsection-title">Required evidence items</h3>
          <ul className="list-simple">
            {(selectedControl.required_evidence_items || []).map((item, i) => (
              <li key={i}><span className="item-code">{item.item_code}</span> {item.evidence_item_name}</li>
            ))}
          </ul>

          <h3 className="subsection-title">Collected evidence</h3>
          {collected.length === 0 ? (
            <div className="empty-state">
              <p>No evidence for this control yet.</p>
              <p className="empty-hint">Use <strong>Fetch AWS evidence</strong> to run collectors, or add evidence manually below.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Source</th>
                    <th>Collected</th>
                    <th className="th-action" />
                  </tr>
                </thead>
                <tbody>
                  {collected.map((e) => (
                    <tr key={e.evidence_id}>
                      <td><span className="cell-item">{e.item_code}</span></td>
                      <td><span className="cell-source">{e.source_system}</span></td>
                      <td><span className="cell-date">{e.collected_at ? new Date(e.collected_at).toLocaleString() : '—'}</span></td>
                      <td className="td-action">
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => {
                            setContentLoading(true)
                            getEvidenceContent(e.evidence_id)
                              .then((content) => setContentModal({ content, source: e.source_system }))
                              .catch((err) => setContentModal({ error: err.message, source: e.source_system }))
                              .finally(() => setContentLoading(false))
                          }}
                          disabled={contentLoading}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="manual-section">
            <h3 className="subsection-title">Add manual evidence</h3>
            <p className="manual-desc">Submit JSON evidence for this control (e.g. risk register, methodology).</p>
            <div className="manual-form">
              <label className="field">
                <span>Item code</span>
                <input
                  type="text"
                  value={manualForm.item_code}
                  onChange={(e) => setManualForm((f) => ({ ...f, item_code: e.target.value }))}
                  placeholder={(selectedControl?.required_evidence_items?.[0]?.item_code) || 'e.g. H9'}
                />
              </label>
              <label className="field field-textarea">
                <span>JSON content</span>
                <textarea
                  value={manualForm.contentJson}
                  onChange={(e) => setManualForm((f) => ({ ...f, contentJson: e.target.value }))}
                  placeholder='{"description": "…", "updated": "2026-03-14"}'
                  rows={4}
                />
              </label>
              {manualError && <p className="inline-error">{manualError}</p>}
              <button type="button" className="btn-secondary" disabled={manualSubmitting} onClick={handleSubmitManual}>
                {manualSubmitting ? 'Submitting…' : 'Submit evidence'}
              </button>
            </div>
          </div>

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
      ) : (
        <div className="card card-section card-muted">
          <p>Select a control above to see required evidence and collected data.</p>
        </div>
      )}
    </div>
  )
}
