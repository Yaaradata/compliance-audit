export default function EvidenceTable({ data, onViewContent }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Evidence ID</th>
            <th>Item code</th>
            <th>Control ID</th>
            <th>Source system</th>
            <th>File hash</th>
            <th>Collected time</th>
            {onViewContent ? <th>Content</th> : <th>S3 URI</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.evidence_id}>
              <td><code>{String(e.evidence_id).slice(0, 8)}…</code></td>
              <td>{e.item_code}</td>
              <td>{e.control_id}</td>
              <td>{e.source_system}</td>
              <td className="hash" title={e.file_hash}>{String(e.file_hash).slice(0, 16)}…</td>
              <td>{e.collected_at ? new Date(e.collected_at).toLocaleString() : '—'}</td>
              <td>
                {onViewContent ? (
                  <button type="button" className="btn-view-content" onClick={() => onViewContent(e)}>View content</button>
                ) : (
                  <span className="hash" title={e.storage_uri}>{String(e.storage_uri).slice(0, 48)}…</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p style={{ padding: '1rem', color: '#94a3b8' }}>No evidence records yet. Run the collector to collect AWS evidence.</p>}
    </div>
  )
}
