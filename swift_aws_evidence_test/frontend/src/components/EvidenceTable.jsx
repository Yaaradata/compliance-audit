export default function EvidenceTable({ data, onViewContent }) {
  if (!data?.length) {
    return (
      <div className="card card-section">
        <p className="empty-message">No evidence yet. Fetch AWS evidence from Control View to collect data.</p>
      </div>
    )
  }
  return (
    <div className="card card-section table-card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Control</th>
              <th>Source</th>
              <th>Collected</th>
              {onViewContent && <th className="th-action" />}
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.evidence_id}>
                <td><span className="cell-item">{e.item_code}</span></td>
                <td><span className="cell-control">{e.control_id}</span></td>
                <td><span className="cell-source">{e.source_system}</span></td>
                <td><span className="cell-date">{e.collected_at ? new Date(e.collected_at).toLocaleString() : '—'}</span></td>
                {onViewContent && (
                  <td className="td-action">
                    <button type="button" className="btn-action" onClick={() => onViewContent(e)}>
                      View
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
