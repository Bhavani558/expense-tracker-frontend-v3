import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getDashboard, getCategorySummary, getMonthlyTrend, downloadPdf, getExpenses } from '../services/api';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#6b7280'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [catData, setCatData] = useState([]);
  const [trend, setTrend] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {});
    getCategorySummary().then((d) => {
      const arr = Object.entries(d).map(([name, value]) => ({ name, value }));
      setCatData(arr);
      setTotal(arr.reduce((s, c) => s + c.value, 0));
    }).catch(() => {});
    getMonthlyTrend().then(setTrend).catch(() => {});
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const now = new Date();

  const summaryCards = stats ? [
    { label: 'Total Expense', sub: 'All time', value: fmt(stats.totalExpense), icon: '💰', bg: '#dcfce7', col: '#16a34a' },
    { label: 'This Month', sub: now.toLocaleString('default', { month: 'long', year: 'numeric' }), value: fmt(stats.totalExpense), icon: '📅', bg: '#dbeafe', col: '#2563eb' },
    { label: 'This Year', sub: now.getFullYear(), value: fmt(stats.totalExpense), icon: '📆', bg: '#fef3c7', col: '#d97706' },
    { label: 'Total Transactions', sub: 'All time', value: stats.transactionCount, icon: '🧾', bg: '#ede9fe', col: '#7c3aed' },
  ] : [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Reports</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Detailed insights about your expenses</p>
        </div>
        <button onClick={downloadPdf} style={styles.pdfBtn}>⬇️ Download PDF</button>
      </div>

      {/* Summary Cards */}
      <div style={styles.grid4}>
        {summaryCards.map((c) => (
          <div key={c.label} style={{ ...styles.statCard, background: c.bg }}>
            <div style={{ ...styles.icon, background: c.col }}>{c.icon}</div>
            <div>
              <div style={styles.cardLabel}>{c.label}</div>
              <div style={styles.cardValue}>{c.value}</div>
              <div style={styles.cardSub}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.grid2}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={catData} cx="40%" cy="50%" outerRadius={90} dataKey="value">
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Summary Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Category Summary Table</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Total Amount</th>
              <th style={styles.th}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {catData.map((c, i) => (
              <tr key={c.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{fmt(c.value)}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: COLORS[i % COLORS.length], width: `${total ? (c.value / total * 100) : 0}%` }} />
                    </div>
                    <span style={{ fontSize: 13, color: '#6b7280', minWidth: 36 }}>
                      {total ? (c.value / total * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  pdfBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  cardLabel: { fontSize: 12, color: '#6b7280', fontWeight: 500 },
  cardValue: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  cardSub: { fontSize: 11, color: '#9ca3af' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  tableCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: 14, color: '#374151' },
};
