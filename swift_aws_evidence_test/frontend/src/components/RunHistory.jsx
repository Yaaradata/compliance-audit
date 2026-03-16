import { useState, Fragment } from 'react'
import { getRunDetail } from '../api/api'

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
    return <p style={{ color: '#94a3b8' }}>No collector runs yet. Run the collector from the backend to populate data.</p>
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th style={{ width: 32 }}></th>
            <th>Run ID</th>
            <th>Collector</th>
            <th>Cloud</th>
            <th>In Time</th>
            <th>Out Time</th>
            <th>Status</th>
            <th>Trigger</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <Fragment key={r.run_id}>
              <tr className={expandedRunId === r.run_id ? 'row-expanded' : ''}>
                <td>
                  <button type="button" className="btn-expand" onClick={() => toggleRun(r.run_id)} aria-label={expandedRunId === r.run_id ? 'Collapse' : 'Show AWS calls'}>
                    {expandedRunId === r.run_id ? '▼' : '▶'}
                  </button>
                </td>
                <td><code>{String(r.run_id).slice(0, 8)}…</code></td>
                <td>{r.collector_name}</td>
                <td>{r.cloud_provider}</td>
                <td>{r.in_time ? new Date(r.in_time).toLocaleString() : (r.execution_time ? new Date(r.execution_time).toLocaleString() : '—')}</td>
                <td>{r.out_time ? new Date(r.out_time).toLocaleString() : '—'}</td>
                <td><span style={{ color: r.status === 'success' ? '#4ade80' : r.status === 'failed' ? '#f87171' : '#fbbf24' }}>{r.status}</span></td>
                <td>{r.trigger_type || '—'}</td>
                <td>
                  <button type="button" className="btn-view-content" onClick={() => toggleRun(r.run_id)}>
                    {expandedRunId === r.run_id ? 'Hide AWS calls' : 'Show AWS calls'}
                  </button>
                </td>
              </tr>
              {expandedRunId === r.run_id && (
                <tr key={`${r.run_id}-detail`}>
                  <td colSpan={9} style={{ padding: 0, borderTop: 0, verticalAlign: 'top' }}>
                    <div className="run-detail-aws-calls">
                      {loadingDetail ? (
                        <p style={{ padding: '1rem', color: '#94a3b8' }}>Loading…</p>
                      ) : runDetail?.aws_calls ? (
                        <>
                          <p style={{ margin: '0.75rem 1rem 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            <strong>Run ID:</strong> {runDetail.run_id} &nbsp;|&nbsp;
                            <strong>In Time:</strong> {runDetail.in_time ? new Date(runDetail.in_time).toLocaleString() : '—'} &nbsp;|&nbsp;
                            <strong>Out Time:</strong> {runDetail.out_time ? new Date(runDetail.out_time).toLocaleString() : '—'} &nbsp;|&nbsp;
                            <strong>Evidence count:</strong> {runDetail.evidence_count} &nbsp;|&nbsp;
                            <strong>AWS calls by collector:</strong>
                          </p>
                          <div className="aws-calls-structure">
                            {runDetail.aws_calls.map(({ collector, apis }) => (
                              <div key={collector} className="aws-calls-collector">
                                <div className="aws-calls-collector-name">{collector}</div>
                                <ul className="aws-calls-list">
                                  {apis.map((api, i) => (
                                    <li key={i}><code>{api}</code></li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p style={{ padding: '1rem', color: '#f87171' }}>Could not load run detail.</p>
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
