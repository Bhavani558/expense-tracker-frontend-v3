import { useEffect, useState } from 'react';
import { getBudgetStatus, saveBudget, getCategorySummary } from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];
const DEFAULT_BUDGETS = { Food: 5000, Transport: 3000, Shopping: 3000, Bills: 2000, Entertainment: 2000, Others: 1000 };
const COLORS = { Food: '#22c55e', Transport: '#3b82f6', Shopping: '#f59e0b', Bills: '#ef4444', Entertainment: '#a855f7', Others: '#6b7280' };

export default function Budget() {
  const [budget, setBudget] = useState(null);
  const [catSpent, setCatSpent] = useState({});
  const [newBudget, setNewBudget] = useState('');
  const [catBudgets, setCatBudgets] = useState({ ...DEFAULT_BUDGETS });
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    getBudgetStatus().then(setBudget).catch(() => {});
    getCategorySummary().then(setCatSpent).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSaveBudget = async () => {
    if (!newBudget || isNaN(newBudget)) return;
    setSaving(true);
    try {
      await saveBudget(parseFloat(newBudget));
      setMsg('Budget saved!');
      setNewBudget('');
      load();
      setTimeout(() => setMsg(''), 3000);
    } finally { setSaving(false); }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const saveCatBudget = () => {
    setCatBudgets({ ...catBudgets, [editCat]: parseFloat(editVal) || 0 });
    setEditCat(null);
  };

  const totalCatBudget = Object.values(catBudgets).reduce((a, b) => a + b, 0);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Budget Goals</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Set and track your monthly budget goals</p>

      {/* Monthly Overview */}
      {budget && (
        <div style={styles.overviewCard}>
          <h3 style={styles.sectionTitle}>Monthly Budget Overview</h3>
          <div style={styles.overviewGrid}>
            <div>
              <div style={styles.ovLabel}>Budget Amount</div>
              <div style={styles.ovValue}>{fmt(budget.budget)}</div>
            </div>
            <div>
              <div style={styles.ovLabel}>Spent Amount</div>
              <div style={styles.ovValue}>{fmt(budget.spent)}</div>
            </div>
            <div>
              <div style={styles.ovLabel}>Remaining Amount</div>
              <div style={{ ...styles.ovValue, color: budget.remaining >= 0 ? '#16a34a' : '#dc2626' }}>
                {fmt(budget.remaining)}
              </div>
            </div>
          </div>
          <div style={styles.progressWrap}>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${Math.min(budget.percentageUsed, 100)}%`,
                background: budget.percentageUsed >= 100 ? '#ef4444' : budget.percentageUsed >= 80 ? '#f59e0b' : '#22c55e',
              }} />
            </div>
            <span style={styles.pct}>{budget.percentageUsed}%</span>
          </div>
          <div style={{
            marginTop: 12,
            background: budget.percentageUsed >= 100 ? '#fef2f2' : '#f0fdf4',
            color: budget.percentageUsed >= 100 ? '#dc2626' : '#16a34a',
            border: `1px solid ${budget.percentageUsed >= 100 ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: 8, padding: '10px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {budget.percentageUsed >= 100 ? '⚠️' : '✅'} {budget.alert}
          </div>
        </div>
      )}

      {/* Set/Update Budget */}
      <div style={styles.setBudgetCard}>
        <h3 style={styles.sectionTitle}>
          {budget ? 'Update Monthly Budget' : 'Set Monthly Budget'}
        </h3>
        {msg && <div style={styles.successMsg}>{msg}</div>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            style={styles.input}
            type="number"
            placeholder={budget ? `Current: ${fmt(budget.budget)}` : 'Enter monthly budget'}
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
          />
          <button onClick={handleSaveBudget} disabled={saving} style={styles.saveBtn}>
            {saving ? 'Saving…' : budget ? 'Update Budget' : '+ Add Budget Goal'}
          </button>
        </div>
      </div>

      {/* Category Budget Goals */}
      <div style={styles.catCard}>
        <h3 style={styles.sectionTitle}>Budget Goals by Category</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Category', 'Budget', 'Spent', 'Progress', 'Status', 'Actions'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => {
              const budget = catBudgets[cat] || 0;
              const spent = catSpent[cat] || 0;
              const pct = budget ? Math.min((spent / budget) * 100, 100) : 0;
              const exceeded = spent > budget;
              const onTrack = !exceeded;
              return (
                <tr key={cat} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={styles.td}>{cat}</td>
                  <td style={styles.td}>
                    {editCat === cat ? (
                      <input
                        style={{ ...styles.input, width: 100, padding: '4px 8px' }}
                        type="number" value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                      />
                    ) : fmt(budget)}
                  </td>
                  <td style={styles.td}>{fmt(spent)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: exceeded ? '#ef4444' : COLORS[cat], width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#6b7280', minWidth: 32 }}>{Math.round(pct)}%</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                      background: exceeded ? '#fef2f2' : '#f0fdf4',
                      color: exceeded ? '#dc2626' : '#16a34a',
                    }}>
                      {exceeded ? 'Exceeded' : 'On Track'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {editCat === cat ? (
                      <>
                        <button onClick={saveCatBudget} style={styles.iconBtn}>✅</button>
                        <button onClick={() => setEditCat(null)} style={styles.iconBtn}>❌</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditCat(cat); setEditVal(catBudgets[cat]); }} style={styles.iconBtn}>✏️</button>
                        <button onClick={() => setCatBudgets({ ...catBudgets, [cat]: 0 })} style={styles.iconBtn}>🗑️</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  overviewCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 },
  ovLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  ovValue: { fontSize: 26, fontWeight: 700, color: '#1e293b' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  progressBar: { flex: 1, background: '#f1f5f9', borderRadius: 99, height: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.4s' },
  pct: { fontSize: 14, fontWeight: 700, color: '#1e293b', minWidth: 36 },
  setBudgetCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 },
  successMsg: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14 },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none' },
  saveBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' },
  catCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: 14, color: '#374151' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, marginRight: 4 },
};
