import { useState, Fragment } from 'react'
import { getRunDetail } from '../api/api'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

export default function RunHistory({ runs }) {
  const [expandedRunId, setExpandedRunId] = useState(null)
  const [runDetail, setRunDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const toggleRun = (runId) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null)
      setRunDetail(null)
      return
    }
    setExpandedRunId(runId)
    setLoadingDetail(true)
    getRunDetail(runId)
      .then(setRunDetail)
      .catch(() => setRunDetail(null))
      .finally(() => setLoadingDetail(false))
  }

  if (!runs?.length) {
    return (
      <div className="empty-state">
        <p>No collector runs yet. Use <strong>Fetch AWS evidence</strong> from Control View to collect data.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="th-expand" />
            <th>Date</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Trigger</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <Fragment key={r.run_id}>
              <tr className={expandedRunId === r.run_id ? 'row-expanded' : ''}>
                <td className="td-expand">
                  <button
                    type="button"
                    className="btn-expand"
                    onClick={() => toggleRun(r.run_id)}
                    aria-label={expandedRunId === r.run_id ? 'Collapse' : 'Show details'}
                  >
                    {expandedRunId === r.run_id ? '▼' : '▶'}
                  </button>
                </td>
                <td><span className="cell-date">{formatDate(r.in_time || r.execution_time)}</span></td>
                <td>
                  <span className={`status status-${r.status}`}>{r.status}</span>
                </td>
                <td><span className="cell-num">{r.evidence_count ?? '—'}</span></td>
                <td><span className="cell-trigger">{r.trigger_type || '—'}</span></td>
              </tr>
              {expandedRunId === r.run_id && (
                <tr key={`${r.run_id}-detail`} className="row-detail">
                  <td colSpan={5}>
                    <div className="run-detail">
                      {loadingDetail ? (
                        <p className="detail-loading">Loading…</p>
                      ) : runDetail?.aws_calls?.length ? (
                        <div className="detail-aws">
                          <p className="detail-heading">AWS API calls by collector</p>
                          <div className="aws-grid">
                            {runDetail.aws_calls.map(({ collector, apis }) => (
                              <div key={collector} className="aws-block">
                                <div className="aws-block-name">{collector}</div>
                                <ul>
                                  {apis.map((api, i) => (
                                    <li key={i}><code>{api}</code></li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="detail-empty">No detail available.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
