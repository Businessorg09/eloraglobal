'use client';
import { useState } from 'react';

type MatchResult = {
  username: string;
  leftBv: number;
  rightBv: number;
  matchedBv: number;
  incomeEarned: number;
  capApplied: boolean;
};

export default function AdminBinaryMatching() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const handleRun = async () => {
    if (!confirm('Are you sure you want to run binary matching? This will calculate payouts and deduct BV.')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/binary-matching/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        alert('Binary matching executed successfully.');
      } else {
        alert('Failed to run binary matching.');
      }
    } catch (e) {
      alert('Error running binary matching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1>⚡ Binary Matching</h1>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3>Status</h3>
          <p style={{ marginTop: '1rem', color: '#a3a3a3' }}>Last run: <strong>N/A</strong></p>
          <p style={{ color: '#a3a3a3' }}>Next scheduled run: <strong>Manual Trigger</strong></p>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button 
            onClick={handleRun} 
            disabled={loading}
            className="btn btn-primary" 
            style={{ padding: '1rem', fontSize: '1.1rem', width: '100%' }}
          >
            {loading ? 'Running...' : '🚀 Run Weekly Binary Matching'}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.05)' }}>
        <h3>Matching Rules (Reference)</h3>
        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: '#a3a3a3', lineHeight: '1.6' }}>
          <li>Matches Left BV and Right BV at 10% ratio.</li>
          <li>1 BV = ₹1.</li>
          <li>Deducts matched volume from both legs (flush).</li>
          <li>Applies weekly capping based on user's rank.</li>
        </ul>
      </div>

      {results && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Matching Results</h3>
          <div className="custom-table-container">
            <table className="custom-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Left BV</th>
                  <th>Right BV</th>
                  <th>Matched BV</th>
                  <th>Income Earned</th>
                  <th>Cap Applied</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>No matches found.</td></tr>
                ) : (
                  results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.username}</td>
                      <td>{r.leftBv}</td>
                      <td>{r.rightBv}</td>
                      <td>{r.matchedBv}</td>
                      <td style={{ color: '#10b981' }}>₹{r.incomeEarned.toLocaleString()}</td>
                      <td>
                        {r.capApplied ? <span className="badge badge-warning">Yes</span> : <span className="badge badge-success">No</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
