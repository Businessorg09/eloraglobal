'use client';
import { useState } from 'react';

export default function AdminTradingPayouts() {
  const [traderUsername, setTraderUsername] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [exchangeRate, setExchangeRate] = useState('83.50');
  
  const [preview, setPreview] = useState<{
    trader: number;
    sponsorPool: number;
    leadershipPool: number;
    company: number;
    total: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handlePreview = () => {
    const usd = parseFloat(amountUsd);
    const rate = parseFloat(exchangeRate);
    if (isNaN(usd) || isNaN(rate) || usd <= 0 || rate <= 0 || !traderUsername) {
      alert('Please fill all fields correctly.');
      return;
    }
    const totalInr = usd * rate;
    setPreview({
      trader: totalInr * 0.70,
      sponsorPool: totalInr * 0.15,
      leadershipPool: totalInr * 0.05,
      company: totalInr * 0.10,
      total: totalInr
    });
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const usd = parseFloat(amountUsd);
      const rate = parseFloat(exchangeRate);
      const res = await fetch('/api/admin/trading-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traderUsername,
          payoutAmountUsdCents: Math.round(usd * 100),
          exchangeRateUsdToInr: rate
        })
      });
      if (res.ok) {
        alert('Payout submitted successfully!');
        setPreview(null);
        setTraderUsername('');
        setAmountUsd('');
      } else {
        const error = await res.json();
        alert('Error: ' + error.message);
      }
    } catch (e) {
      alert('Error submitting payout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1>💹 Trading Payout Entry</h1>
      </div>

      <div className="glass-card glow-primary" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Trader Username</label>
          <input 
            type="text" 
            className="form-input" 
            value={traderUsername} 
            onChange={e => setTraderUsername(e.target.value)} 
            placeholder="e.g. johndoe"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Payout Amount (USD)</label>
          <input 
            type="number" 
            className="form-input" 
            value={amountUsd} 
            onChange={e => setAmountUsd(e.target.value)} 
            placeholder="e.g. 1000"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Exchange Rate (USD to INR)</label>
          <input 
            type="number" 
            className="form-input" 
            value={exchangeRate} 
            onChange={e => setExchangeRate(e.target.value)} 
          />
        </div>
        <button onClick={handlePreview} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
          Preview Split
        </button>
      </div>

      {preview && (
        <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid #6366f1' }}>
          <h3>Payout Split Preview</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Trader gets (70%)</span>
              <strong style={{ color: '#00e5ff' }}>₹{preview.trader.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sponsor Pool (15%)</span>
              <strong style={{ color: '#cd7f32' }}>₹{preview.sponsorPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Leadership Pool (5%)</span>
              <strong style={{ color: '#ffd700' }}>₹{preview.leadershipPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Company (10%)</span>
              <strong style={{ color: '#a3a3a3' }}>₹{preview.company.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span>Total Value (INR)</span>
              <strong>₹{preview.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </li>
          </ul>
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none' }}>
            {loading ? 'Submitting...' : 'Confirm & Submit Payout'}
          </button>
        </div>
      )}

      <div className="glass-card">
        <h3>Recent Payouts</h3>
        <p style={{ color: '#a3a3a3', marginTop: '1rem' }}>Payout history coming soon...</p>
      </div>
    </div>
  );
}
